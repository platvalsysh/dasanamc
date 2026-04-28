import { type LoaderFunctionArgs } from "react-router";
import { prisma } from "@repo/database";
import { utils, write } from "xlsx";
import { getSearchWhere } from "../../member/list/page";
import { useAuthServerContext } from "@repo/auth/server";

// Helper to format date if needed (optional based on requirements)
// Currently, legacy code seems to just dump values.

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.excel.download"])) {
      throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const searchValues = {
    keyword: url.searchParams.get("keyword") || undefined,
    field: url.searchParams.get("field") || undefined,
  };

  const where = getSearchWhere(searchValues);

  // Fetch all matching records (without pagination)
  // Limit to avoid memory crash, but high enough for typical usage
  const members = await prisma.bxmember.findMany({
    where,
    orderBy: { seq: "desc" },
  });

  // Map to legacy columns
  const data = members.map((m) => ({
    name_kor: m.name_kor,
    name_ch: m.name_ch,
    sex: m.sex,
    major: m.major,
    graduate_number: m.graduate_number,
    graduate_year: m.graduate_year,
    graduate_month: m.graduate_month,
    master_major: m.master_major,
    master_graduate_number: m.master_graduate_number,
    master_graduate_year: m.master_graduate_year,
    master_graduate_month: m.master_graduate_month,
    doctor_major: m.doctor_major,
    doctor_graduate_number: m.doctor_graduate_number,
    doctor_graduate_year: m.doctor_graduate_year,
    doctor_graduate_month: m.doctor_graduate_month,
    // course: m.course,      // Deprecated
    // finish_flag: m.finish_flag, // Deprecated
    // finish_year: m.finish_year, // Deprecated
    decease: m.decease,
    job_class: m.job_class,
    office_zipcode: m.office_zipcode,
    office_address: m.office_address,
    office_name: m.office_name,
    office_position: m.office_position,
    office_phone_number: m.office_phone_number,
    office_fax_number: m.office_fax_number,
    office_area: m.office_area,
    email: m.email,
    zipcode: m.zipcode,
    address: m.address,
    phone_number: m.phone_number,
    fax_number: m.fax_number,
    cellphone_number: m.cellphone_number,
    remark: m.remark,
    enter_year: m.enter_year,
    search_agree: m.search_agree,
    is_major: m.is_major,
    seq: m.seq,
    member_srl: m.member_srl !== null ? m.member_srl.toString() : null, // BigInt -> Number for JSON/XLSX safety
    user_id: m.user_id,
  }));

  // Create worksheet
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Members");

  // Generate buffer
  const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = `members_${new Date().toISOString().split('T')[0]}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
