import { type LoaderFunctionArgs, data as response, type useLoaderData } from "react-router";
import { prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.group.list"])) { // or member.list
      throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const groupId = url.searchParams.get("group_id");

  if (!groupId) {
      return response({ members: [] });
  }

  const members = await prisma.bxmember_group_members.findMany({
      where: { group_id: groupId },
      select: {
          id: true,
          group_id: true,
          type: true,
          name: true,
          cellphone_number: true,
          email: true,
          created_at: true,
          member_id: true,
          professor_id: true,
          executive_id: true,
          extra_vars: true,
          bxmember: {
              select: {
                  cellphone_number: true,
                  email: true,
                  major: true,
                  graduate_number: true,
                  name_kor: true
              }
          },
          bxprofessor: {
              select: {
                  cellphone_number: true,
                  email: true,
                  name_kor: true
              }
          },
          organization_members: {
              select: {
                  name: true,
                  major: true,
                  gisu: true,
                  organization_groups: {
                      select: { name: true }
                  },
                  organization_positions: {
                      select: { name: true }
                  },
                  bxmember: {
                      select: {
                          cellphone_number: true,
                          email: true
                      }
                  }
              }
          }
      },
      orderBy: { created_at: "desc" }
  });

  const serializedMembers = members.map((m) => {
      let compute_name = "";
      let compute_phone = "";
      let compute_email = "";
      let compute_major = "";
      let compute_graduate_number = "";
      
      let group_name = "";
      let position_name = "";

      if (m.type === "MEMBER" && m.bxmember) {
          compute_name = m.bxmember.name_kor || "";
          compute_phone = m.bxmember.cellphone_number || "";
          compute_email = m.bxmember.email || "";
          compute_major = m.bxmember.major || "";
          compute_graduate_number = m.bxmember.graduate_number || "";
      } else if (m.type === "PROFESSOR" && m.bxprofessor) {
          compute_name = m.bxprofessor.name_kor || "";
          compute_phone = m.bxprofessor.cellphone_number || "";
          compute_email = m.bxprofessor.email || "";
      } else if (m.type === "EXECUTIVE" && m.organization_members) {
          const orgData = m.organization_members;
          compute_name = orgData.name || "";
          compute_phone = orgData.bxmember?.cellphone_number || "";
          compute_email = orgData.bxmember?.email || "";
          compute_major = orgData.major || "";
          compute_graduate_number = orgData.gisu || "";
          group_name = orgData.organization_groups?.name || "";
          position_name = orgData.organization_positions?.name || "";
      } else {
          compute_name = m.name || "";
          compute_phone = m.cellphone_number || "";
          compute_email = m.email || "";
      }

      let compute_memo = "";
      try {
          const ev = m.extra_vars as any;
          if (ev) {
             if (typeof ev === 'string') compute_memo = JSON.parse(ev).memo || "";
             else compute_memo = ev.memo || "";
          }
      } catch (e) {}

      return {
        ...m,
        professor_id: m.professor_id ? m.professor_id.toString() : null,
        member_id: m.member_id ? m.member_id.toString() : null,
        executive_id: m.executive_id ? m.executive_id.toString() : null,
        compute_name,
        compute_phone,
        compute_email,
        compute_major,
        compute_graduate_number,
        compute_memo,
        group_name,
        position_name
      };
  });

  return response({ members: serializedMembers });
}

export type GroupMembersLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;