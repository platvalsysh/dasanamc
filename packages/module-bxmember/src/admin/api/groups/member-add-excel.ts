import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

/**
 * 엑셀 데이터를 통한 그룹 구성원 일괄 추가 API
 * 
 * 규칙:
 * 1. bxmember에서 이름(name_kor)이 일치하고 (전화번호 또는 이메일)이 일치하면 MEMBER 유형으로 추가
 * 2. 없으면 bxprofessor에서 이름(name_kor)이 일치하고 (전화번호 또는 이메일)이 일치하면 PROFESSOR 유형으로 추가
 * 3. 둘 다 없으면 DIRECT 유형으로 추가
 */
export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.edit"])) {
        return response({ success: false, error: "권한이 없습니다." }, { status: 403 });
    }

    const formData = await request.formData();
    const groupId = formData.get("group_id") as string;
    const rowsStr = formData.get("rows") as string;

    if (!groupId || !rowsStr) {
        return response({ success: false, error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    let rows: any[] = [];
    try {
        rows = JSON.parse(rowsStr);
        if (!Array.isArray(rows)) throw new Error("Rows must be an array");
    } catch (e) {
        return response({ success: false, error: "데이터 형식이 올바르지 않습니다." }, { status: 400 });
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const row of rows) {
                const { name, phone, email, memo } = row;
                
                // 이름이 없으면 스킵
                if (!name || !name.trim()) continue;

                const trimmedName = name.trim();
                const trimmedPhone = phone?.trim() || null;
                const trimmedEmail = email?.trim() || null;

                // 1. bxmember 조회 (이름으로만)
                const candidateMembers = await tx.bxmember.findMany({
                    where: { name_kor: trimmedName }
                });

                // JS 상에서 전화번호 또는 이메일 일치 여부 확인
                const matchedMember = candidateMembers.find(m => {
                    const phoneMatch = trimmedPhone && m.cellphone_number === trimmedPhone;
                    const emailMatch = trimmedEmail && m.email === trimmedEmail;
                    return phoneMatch || emailMatch;
                });

                // 2. bxmember 결과가 없으면 bxprofessor 조회 (이름으로만)
                let matchedProfessor = null;
                if (!matchedMember) {
                    const candidateProfessors = await tx.bxprofessor.findMany({
                        where: { name_kor: trimmedName }
                    });

                    matchedProfessor = candidateProfessors.find(p => {
                        const phoneMatch = trimmedPhone && p.cellphone_number === trimmedPhone;
                        const emailMatch = trimmedEmail && p.email === trimmedEmail;
                        return phoneMatch || emailMatch;
                    });
                }

                // 3. 기록 생성
                if (matchedMember) {
                    await tx.bxmember_group_members.create({
                        data: {
                            group_id: groupId,
                            type: 'MEMBER',
                            name: trimmedName,
                            cellphone_number: trimmedPhone || matchedMember.cellphone_number,
                            email: trimmedEmail || matchedMember.email,
                            member_id: matchedMember.seq,
                            extra_vars: memo ? { memo } : {},
                        }
                    });
                } else if (matchedProfessor) {
                    await tx.bxmember_group_members.create({
                        data: {
                            group_id: groupId,
                            type: 'PROFESSOR',
                            name: trimmedName,
                            cellphone_number: trimmedPhone || matchedProfessor.cellphone_number,
                            email: trimmedEmail || matchedProfessor.email,
                            professor_id: matchedProfessor.seq,
                            extra_vars: memo ? { memo } : {},
                        }
                    });
                } else {
                    await tx.bxmember_group_members.create({
                        data: {
                            group_id: groupId,
                            type: 'DIRECT',
                            name: trimmedName,
                            cellphone_number: trimmedPhone,
                            email: trimmedEmail,
                            extra_vars: memo ? { memo } : {},
                        }
                    });
                }
            }
        }, {
            timeout: 30000 // 대량 처리를 고려하여 타임아웃 30초 설정
        });

        return response({ success: true });
    } catch (e: any) {
        console.error("Member add excel error:", e);
        return response({ success: false, error: e.message || "데이터 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
