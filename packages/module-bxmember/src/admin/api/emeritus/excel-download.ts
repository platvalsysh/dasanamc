import { type LoaderFunctionArgs } from "react-router";
import { prisma, type Prisma } from "@repo/database";
import { utils, write } from "xlsx";
import { useAuthServerContext } from "@repo/auth/server";

// Helper to format date if needed
// Currently, legacy code seems to just dump values.

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.emeritus.excel.download"])) {
      throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword") || undefined;
  const field = url.searchParams.get("field") || undefined;

  const where: Prisma.bxemeritusWhereInput = {};
  if (keyword) {
      if (field === 'name_kor') where.name_kor = { contains: keyword, mode: 'insensitive'};
      else if (field === 'email') where.email = { contains: keyword, mode: 'insensitive'};
      else if (field === 'cellphone_number') where.cellphone_number = { contains: keyword, mode: 'insensitive'};
      else where.name_kor = { contains: keyword, mode: 'insensitive'};
  }

  // Fetch all matching records (without pagination)
  const emerituss = await prisma.bxemeritus.findMany({
    where,
    orderBy: { seq: "asc" },
  });

  // Map to legacy columns
  const data = emerituss.map((m) => ({
    seq: m.seq.toString(),
    name_kor: m.name_kor || "",
    email: m.email || "",
    cellphone_number: m.cellphone_number || "",
  }));

  // Create worksheet
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Emerituss");

  // Generate buffer
  const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = `emerituss_${new Date().toISOString().split('T')[0]}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
