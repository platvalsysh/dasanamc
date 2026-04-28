import { type ActionFunctionArgs } from "react-router";
import { prisma } from "@repo/database";
import { read, utils } from "xlsx";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "@repo/module-file/module";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.professor.excel.upload"])) {
      return JsonResponse.error("Permission denied", 403);
  }
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return JsonResponse.error("No file uploaded", 400);
  }

  try {
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // 1. Parse Excel First
    const workbook = read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // 2. Validate Header
    if (!rawData || rawData.length === 0) {
         return JsonResponse.error("Empty Excel file", 400);
    }
    const headerRow = rawData[0];
    // Professor: seq, name_kor, email, cellphone_number => 4 columns
    if (headerRow.length < 4) {
         return JsonResponse.error(`Invalid Excel format. Expected at least 4 columns, found ${headerRow.length}.`, 400);
    }

    // 3. Upload Direct (Only if valid)
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const extension = file.name.split(".").pop();
    const s3Key = `bxmember/professor/${timestamp}_${crypto.randomUUID()}.${extension}`;
    
    await FileService.uploadDirectly({
      module: "bxmember",
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      bucket: "files",
      s3_key: s3Key,
      status: "U",
      buffer: fileBuffer,
    });

    const dataRows = rawData.slice(1);

    // Pre-process data
    const professorsToProcess = dataRows.map(row => {
      if (!row || row.length === 0) return null;
      const getValue = (idx: number) => row[idx] ? String(row[idx]).trim() : undefined;
      
      const seqRaw = getValue(0);
      const name_kor = getValue(1);
      const email = getValue(2);
      const cellphone_number = getValue(3);

      if (!name_kor) return null;

      const parsedSeq = seqRaw ? BigInt(seqRaw) : undefined;
      // Note: BigInt("abc") will throw, so we need safe parsing?
      // Assuming seqRaw is numeric string from Excel. 
      // If risky, we can try/catch parsing in map.
      let safeSeq: bigint | undefined = undefined;
      try {
        if (seqRaw) safeSeq = BigInt(seqRaw);
      } catch (e) {
        // Invalid seq format, treat as new? or skip? let's treat as undefined (new)
      }

      return {
          name_kor,
          email,
          cellphone_number,
          seq: safeSeq
      };
    }).filter(p => p !== null) as any[];

    let successCount = 0;

    // 4. Transaction
    await prisma.$transaction(async (tx) => {
      // A. Batch Check Existing
      const providedSeqs = professorsToProcess
          .map(p => p.seq)
          .filter(s => s !== undefined) as bigint[];
      
      let existingSeqSet = new Set<bigint>(); // BigInt Set? Maps/Sets use SameValueZero. BigInt(1) === BigInt(1).
      // However, iterating providedSeqs and comparing with === works.
      
      if (providedSeqs.length > 0) {
          const existingRecords = await tx.bxprofessor.findMany({
             where: { seq: { in: providedSeqs } },
             select: { seq: true }
          });
          // Note: using string rep for Set key might be safer if BigInt polyfill issues, but Node env is fine.
          existingRecords.forEach(r => existingSeqSet.add(r.seq));
      }

      // B. Max Seq
      const last = await tx.bxprofessor.findFirst({ orderBy: { seq: 'desc' } });
      let currentMaxSeq = last?.seq || 0n;

      // C. Process
      for (const memberData of professorsToProcess) {
        const { seq, ...data } = memberData;

        if (seq) {
          if (existingSeqSet.has(seq)) {
             // Update
             await tx.bxprofessor.update({
               where: { seq },
               data: data
             });
          } else {
             // Insert specific
             await tx.bxprofessor.create({
               data: {
                 ...data,
                 seq,
               }
             });
          }
        } else {
          // Insert auto-inc
          currentMaxSeq = currentMaxSeq + 1n;
          await tx.bxprofessor.create({
            data: {
              ...data,
              seq: currentMaxSeq,
            }
          });
        }
        successCount++;
      }
    }, {
        maxWait: 120000,
        timeout: 120000
    });

    return JsonResponse.ok({ success: true, count: successCount });

  } catch (error: any) {
    console.error("Excel Processing Error:", error);
    return JsonResponse.error(error.message || "Processing failed", 500);
  }
}
