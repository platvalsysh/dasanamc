import { type ActionFunctionArgs } from "react-router";
import { prisma } from "@repo/database";
import { read, utils } from "xlsx";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "@repo/module-file/module";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.excel.upload"])) {
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

    // 1. Parse Excel First (to validate before uploading)
    const workbook = read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // 2. Validate Header
    if (!rawData || rawData.length === 0) {
        return JsonResponse.error("Empty Excel file", 400);
    }
    const headerRow = rawData[0];
    if (headerRow.length < 37) {
        return JsonResponse.error(`Invalid Excel format. Expected at least 37 columns, found ${headerRow.length}.`, 400);
    }

    // 3. Upload File Directly (Now that validtion passed)
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const extension = file.name.split(".").pop();
    const s3Key = `bxmember/member/${timestamp}_${crypto.randomUUID()}.${extension}`;

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
    const membersToProcess = dataRows.map(row => {
      if (!row || row.length === 0) return null;
      const getValue = (idx: number) => row[idx] ? String(row[idx]).trim() : undefined;
      
      const parsedSeq = row[34] ? parseInt(String(row[34])) : undefined;
      const validSeq = (parsedSeq && !isNaN(parsedSeq)) ? parsedSeq : undefined;

      const memberData = {
        name_kor: getValue(0),
        name_ch: getValue(1),
        sex: getValue(2),
        major: getValue(3),
        graduate_number: getValue(4),
        graduate_year: getValue(5),
        graduate_month: getValue(6),
        master_major: getValue(7),
        master_graduate_number: getValue(8),
        master_graduate_year: getValue(9),
        master_graduate_month: getValue(10),
        doctor_major: getValue(11),
        doctor_graduate_number: getValue(12),
        doctor_graduate_year: getValue(13),
        doctor_graduate_month: getValue(14),
        decease: getValue(15), 
        job_class: getValue(16),
        office_zipcode: getValue(17),
        office_address: getValue(18),
        office_name: getValue(19),
        office_position: getValue(20),
        office_phone_number: getValue(21),
        office_fax_number: getValue(22),
        office_area: getValue(23),
        email: getValue(24),
        zipcode: getValue(25),
        address: getValue(26),
        phone_number: getValue(27),
        fax_number: getValue(28),
        cellphone_number: getValue(29),
        remark: getValue(30),
        enter_year: getValue(31), 
        search_agree: getValue(32),
        is_major: getValue(33),
        seq: validSeq,
        member_srl: row[35] ? BigInt(String(row[35])) : undefined,
        user_id: getValue(36),
      };

      if (!memberData.name_kor) return null;
      return memberData;
    }).filter(item => item !== null) as any[];

    let successCount = 0;

    // 4. Transaction (Optimized)
    await prisma.$transaction(async (tx) => {
        // A. Batch check existing SEQs
        const providedSeqs = membersToProcess
            .map(m => m.seq)
            .filter(s => s !== undefined) as number[];
        
        let existingSeqSet = new Set<number>();
        if (providedSeqs.length > 0) {
            const existingRecords = await tx.bxmember.findMany({
                where: { seq: { in: providedSeqs } },
                select: { seq: true }
            });
            existingSeqSet = new Set(existingRecords.map(r => r.seq));
        }

        // B. Get Max Seq Once
        const lastRecord = await tx.bxmember.findFirst({ orderBy: { seq: 'desc' } });
        let currentMaxSeq = lastRecord?.seq || 0;

        // C. Process
        for (const memberData of membersToProcess) {
            if (memberData.seq) {
              if (existingSeqSet.has(memberData.seq)) {
                // Update
                await tx.bxmember.update({
                  where: { seq: memberData.seq },
                  data: {
                     ...memberData,
                     seq: undefined, 
                     member_srl: undefined,
                  }
                });
              } else {
                // Insert with specific SEQ
                await tx.bxmember.create({
                  data: {
                    ...memberData,
                    seq: memberData.seq,
                    enter_year: memberData.enter_year,
                  }
                });
              }
            } else {
              // Insert with auto-increment SEQ
              currentMaxSeq++;
              await tx.bxmember.create({
                data: {
                  ...memberData,
                  enter_year: memberData.enter_year,
                  seq: currentMaxSeq,
                }
              });
            }
            successCount++;
        }
    }, {
        maxWait: 120000, // 2 minutes
        timeout: 120000 
    });

    return JsonResponse.ok({ success: true, count: successCount });

  } catch (error: any) {
    console.error("Excel Processing Error:", error);
    return JsonResponse.error(error.message || "Processing failed", 500);
  }
}
