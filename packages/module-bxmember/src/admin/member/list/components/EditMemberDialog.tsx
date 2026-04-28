import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-admin";
import { Button } from "@repo/ui-admin";
import { Input } from "@repo/ui-admin";
import { Label } from "@repo/ui-admin";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import type { bxmember } from "@repo/database";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: bxmember | null;
  options?: {
    majors: string[];
    masterMajors: string[];
    doctorMajors: string[];
  };
}

export function EditMemberDialog({
  open,
  onOpenChange,
  member,
  options = { majors: [], masterMajors: [], doctorMajors: [] },
}: EditMemberDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  if (!member) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>회원 수정</DialogTitle>
          </DialogHeader>
          <fetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="seq" value={member.seq} />
            
            {/* Datalists for autocomplete */}
            <datalist id="edit-majors-list">
              {options.majors.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
            <datalist id="edit-master-majors-list">
              {options.masterMajors.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
            <datalist id="edit-doctor-majors-list">
              {options.doctorMajors.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>

              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-medium mb-4">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>이름(한글) <span className="text-red-500">*</span></Label>
                    <Input name="name_kor" defaultValue={member.name_kor || ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label>이름(한자)</Label>
                    <Input name="name_ch" defaultValue={member.name_ch || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>성별</Label>
                    <Input name="sex" defaultValue={member.sex || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>이메일</Label>
                    <Input name="email" type="email" defaultValue={member.email || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>휴대전화</Label>
                    <Input name="cellphone_number" defaultValue={member.cellphone_number || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>자택 전화번호</Label>
                    <Input name="phone_number" defaultValue={member.phone_number || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>팩스</Label>
                    <Input name="fax_number" defaultValue={member.fax_number || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>작고</Label>
                    <Input name="decease" defaultValue={member.decease || ""} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>비고</Label>
                    <Input name="remark" defaultValue={member.remark || ""} />
                  </div>
                </div>
              </div>

               {/* 자택 주소 */}
               <div>
                  <h3 className="text-lg font-medium mb-4">자택 주소</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>자택우편번호</Label>
                      <Input name="zipcode" defaultValue={member.zipcode || ""} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>자택 주소</Label>
                      <Input name="address" defaultValue={member.address || ""} />
                    </div>
                  </div>
               </div>

              {/* 학력 정보 - 학사 */}
              <div>
                <h3 className="text-lg font-medium mb-4">학력 정보 (학사)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>학사졸업 학과</Label>
                    <Input name="major" list="edit-majors-list" defaultValue={member.major || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>학사입학 년도</Label>
                    <Input name="enter_year" defaultValue={member.enter_year || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>학사졸업 기수</Label>
                    <Input name="graduate_number" defaultValue={member.graduate_number || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>학사졸업 년도</Label>
                    <Input name="graduate_year" defaultValue={member.graduate_year || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>학사졸업 월</Label>
                    <Input name="graduate_month" defaultValue={member.graduate_month || ""} />
                  </div>
                </div>
              </div>
              
              {/* 학력 정보 - 석사 */}
              <div>
                <h3 className="text-lg font-medium mb-4">학력 정보 (석사)</h3>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>석사 전공</Label>
                    <Input name="master_major" list="edit-master-majors-list" defaultValue={member.master_major || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>석사 졸업 기수</Label>
                    <Input name="master_graduate_number" defaultValue={member.master_graduate_number || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>석사 졸업 년도</Label>
                    <Input name="master_graduate_year" defaultValue={member.master_graduate_year || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>석사 졸업 월</Label>
                    <Input name="master_graduate_month" defaultValue={member.master_graduate_month || ""} />
                  </div>
                </div>
              </div>

               {/* 학력 정보 - 박사 */}
               <div>
                  <h3 className="text-lg font-medium mb-4">학력 정보 (박사)</h3>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>박사 전공</Label>
                      <Input name="doctor_major" list="edit-doctor-majors-list" defaultValue={member.doctor_major || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>박사 졸업 기수</Label>
                      <Input name="doctor_graduate_number" defaultValue={member.doctor_graduate_number || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>박사 졸업 년도</Label>
                      <Input name="doctor_graduate_year" defaultValue={member.doctor_graduate_year || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>박사 졸업 월</Label>
                      <Input name="doctor_graduate_month" defaultValue={member.doctor_graduate_month || ""} />
                    </div>
                  </div>
               </div>

                {/* 기타 학력 */}
                {/* <div>
                   <h3 className="text-lg font-medium mb-4">기타 학력</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                       <Label>과정</Label>
                       <Input name="course" defaultValue={member.course || ""} />
                     </div>
                      <div className="space-y-2">
                       <Label>수료 여부</Label>
                       <Input name="finish_flag" defaultValue={member.finish_flag || ""} />
                     </div>
                      <div className="space-y-2">
                       <Label>수료 년도</Label>
                       <Input name="finish_year" defaultValue={member.finish_year || ""} />
                     </div>
                   </div>
                </div> */}

              {/* 직장 정보 */}
              <div>
                 <h3 className="text-lg font-medium mb-4">직장 정보</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>직업군</Label>
                     <Input name="job_class" defaultValue={member.job_class || ""} />
                   </div>
                   <div className="space-y-2">
                     <Label>현/최종 직장명</Label>
                     <Input name="office_name" defaultValue={member.office_name || ""} />
                   </div>
                   <div className="space-y-2">
                     <Label>부서명/직책</Label>
                     <Input name="office_position" defaultValue={member.office_position || ""} />
                   </div>
                   <div className="space-y-2">
                      <Label>지역</Label>
                      <Input name="office_area" defaultValue={member.office_area || ""} />
                    </div>
                   <div className="space-y-2">
                      <Label>직장 전화번호</Label>
                      <Input name="office_phone_number" defaultValue={member.office_phone_number || ""} />
                   </div>
                   <div className="space-y-2">
                      <Label>회사팩스</Label>
                      <Input name="office_fax_number" defaultValue={member.office_fax_number || ""} />
                   </div>
                   <div className="space-y-2">
                     <Label>직장우편번호</Label>
                     <Input name="office_zipcode" defaultValue={member.office_zipcode || ""} />
                   </div>
                   <div className="space-y-2 col-span-2">
                     <Label>직장 주소</Label>
                     <Input name="office_address" defaultValue={member.office_address || ""} />
                   </div>
                 </div>
              </div>
              
              {/* 설정 */}
               <div>
                  <h3 className="text-lg font-medium mb-4">설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>검색 동의</Label>
                      <Input name="search_agree" defaultValue={member.search_agree || ""} placeholder="Y/N" />
                    </div>
                    <div className="space-y-2">
                      <Label>전공 여부</Label>
                      <Input name="is_major" defaultValue={member.is_major || ""} placeholder="Y/N" />
                    </div>
                  </div>
               </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                삭제
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "수정 중..." : "수정"}
                </Button>
              </div>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        memberName={member.name_kor || ""}
        memberSeq={member.seq}
      />
    </>
  );
}
