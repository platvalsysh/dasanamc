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
import { useEffect } from "react";

interface CreateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options?: {
    majors: string[];
    masterMajors: string[];
    doctorMajors: string[];
  };
}

export function CreateMemberDialog({
  open,
  onOpenChange,
  options = { majors: [], masterMajors: [], doctorMajors: [] },
}: CreateMemberDialogProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>회원 추가</DialogTitle>
        </DialogHeader>
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create" />
          
          {/* Datalists for autocomplete */}
          <datalist id="majors-list">
            {options.majors.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
          <datalist id="master-majors-list">
            {options.masterMajors.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
          <datalist id="doctor-majors-list">
            {options.doctorMajors.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>

          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-medium mb-4">기본 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름(한글) <span className="text-red-500">*</span></Label>
                  <Input name="name_kor" required />
                </div>
                <div className="space-y-2">
                  <Label>이름(한자)</Label>
                  <Input name="name_ch" />
                </div>
                <div className="space-y-2">
                  <Label>성별</Label>
                  <Input name="sex" placeholder="남/여" />
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>휴대전화</Label>
                  <Input name="cellphone_number" />
                </div>
                <div className="space-y-2">
                  <Label>자택 전화번호</Label>
                  <Input name="phone_number" />
                </div>
                <div className="space-y-2">
                  <Label>팩스</Label>
                  <Input name="fax_number" />
                </div>
                <div className="space-y-2">
                  <Label>작고</Label>
                  <Input name="decease" placeholder="O/X or Date" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>비고</Label>
                  <Input name="remark" />
                </div>
              </div>
            </div>

            {/* 자택 주소 */}
            <div>
              <h3 className="text-lg font-medium mb-4">자택 주소</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>자택우편번호</Label>
                  <Input name="zipcode" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>자택 주소</Label>
                  <Input name="address" />
                </div>
              </div>
            </div>

            {/* 학력 정보 - 학사 */}
            <div>
              <h3 className="text-lg font-medium mb-4">학력 정보 (학사)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>학사졸업 학과</Label>
                  <Input name="major" list="majors-list" />
                </div>
                <div className="space-y-2">
                  <Label>학사입학 년도</Label>
                  <Input name="enter_year" />
                </div>
                <div className="space-y-2">
                  <Label>학사졸업 기수</Label>
                  <Input name="graduate_number" />
                </div>
                <div className="space-y-2">
                  <Label>학사졸업 년도</Label>
                  <Input name="graduate_year" />
                </div>
                <div className="space-y-2">
                  <Label>학사졸업 월</Label>
                  <Input name="graduate_month" />
                </div>
              </div>
            </div>

            {/* 학력 정보 - 석사 */}
            <div>
              <h3 className="text-lg font-medium mb-4">학력 정보 (석사)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>석사 전공</Label>
                  <Input name="master_major" list="master-majors-list" />
                </div>
                <div className="space-y-2">
                  <Label>석사 졸업 기수</Label>
                  <Input name="master_graduate_number" />
                </div>
                <div className="space-y-2">
                  <Label>석사 졸업 년도</Label>
                  <Input name="master_graduate_year" />
                </div>
                <div className="space-y-2">
                  <Label>석사 졸업 월</Label>
                  <Input name="master_graduate_month" />
                </div>
              </div>
            </div>

            {/* 학력 정보 - 박사 */}
            <div>
              <h3 className="text-lg font-medium mb-4">학력 정보 (박사)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>박사 전공</Label>
                  <Input name="doctor_major" list="doctor-majors-list" />
                </div>
                <div className="space-y-2">
                  <Label>박사 졸업 기수</Label>
                  <Input name="doctor_graduate_number" />
                </div>
                <div className="space-y-2">
                  <Label>박사 졸업 년도</Label>
                  <Input name="doctor_graduate_year" />
                </div>
                <div className="space-y-2">
                  <Label>박사 졸업 월</Label>
                  <Input name="doctor_graduate_month" />
                </div>
              </div>
            </div>

            {/* 기타 학력 */}
            {/* <div>
              <h3 className="text-lg font-medium mb-4">기타 학력</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>과정</Label>
                  <Input name="course" />
                </div>
                 <div className="space-y-2">
                  <Label>수료 여부</Label>
                  <Input name="finish_flag" />
                </div>
                 <div className="space-y-2">
                  <Label>수료 년도</Label>
                  <Input name="finish_year" />
                </div>
              </div>
            </div> */}

            {/* 직장 정보 */}
            <div>
              <h3 className="text-lg font-medium mb-4">직장 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>직업군</Label>
                  <Input name="job_class" />
                </div>
                <div className="space-y-2">
                  <Label>현/최종 직장명</Label>
                  <Input name="office_name" />
                </div>
                <div className="space-y-2">
                  <Label>부서명/직책</Label>
                  <Input name="office_position" />
                </div>
                <div className="space-y-2">
                  <Label>지역</Label>
                  <Input name="office_area" />
                </div>
                <div className="space-y-2">
                   <Label>직장 전화번호</Label>
                   <Input name="office_phone_number" />
                </div>
                <div className="space-y-2">
                   <Label>회사팩스</Label>
                   <Input name="office_fax_number" />
                </div>
                <div className="space-y-2">
                  <Label>직장우편번호</Label>
                  <Input name="office_zipcode" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>직장 주소</Label>
                  <Input name="office_address" />
                </div>
              </div>
            </div>
            
             {/* 설정 */}
             <div>
               <h3 className="text-lg font-medium mb-4">설정</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>검색 동의</Label>
                   <Input name="search_agree" placeholder="Y/N" />
                 </div>
                 <div className="space-y-2">
                   <Label>전공 여부</Label>
                   <Input name="is_major" placeholder="Y/N" />
                 </div>
               </div>
             </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
