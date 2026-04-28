import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, useLoaderData, useNavigate } from "react-router";
import { Form } from "react-router";
import { Button, Input, Checkbox, Textarea, Card, CardHeader, CardTitle, CardContent } from "@repo/ui-admin";
import { prisma } from "@repo/database";
import { z } from "zod";
import { format } from "date-fns";

/* Zod Schema for Validation */
const scheduleSchema = z.object({
    title: z.string().min(1, "일정 제목을 입력해주세요."),
    startDate: z.string().min(1, "시작일시는 필수입니다."),
    startHour: z.string(),
    startMinute: z.string(),
    endDate: z.string().min(1, "종료일시는 필수입니다."),
    endHour: z.string(),
    endMinute: z.string(),
    location: z.string().optional(),
    content: z.string().optional(),
    isImportant: z.string().optional(),
});

/* Loader */
export async function loader({ params }: LoaderFunctionArgs) {
    if (params.id) {
        const schedule = await prisma.schedules.findUnique({
            where: { id: params.id },
        });
        if (!schedule) throw new Response("Not Found", { status: 404 });
        return { schedule };
    }
    return { schedule: null };
}

/* Action */
export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();

    // Combine Date + Time
    const startDateStr = formData.get("startDate") as string;
    const startHour = (formData.get("startHour") as string).padStart(2, '0');
    const startMinute = (formData.get("startMinute") as string).padStart(2, '0');

    const endDateStr = formData.get("endDate") as string;
    const endHour = (formData.get("endHour") as string).padStart(2, '0');
    const endMinute = (formData.get("endMinute") as string).padStart(2, '0');

    const startDateTime = new Date(`${startDateStr}T${startHour}:${startMinute}:00`);
    const endDateTime = new Date(`${endDateStr}T${endHour}:${endMinute}:00`);

    const data = {
        title: formData.get("title") as string,
        start_date: startDateTime,
        end_date: endDateTime,
        location: formData.get("location") as string,
        content: formData.get("content") as string,
        is_important: formData.get("isImportant") === "on",
    };

    if (params.id) {
        await prisma.schedules.update({
            where: { id: params.id },
            data,
        });
    } else {
        await prisma.schedules.create({
            data,
        });
    }

    return redirect("/admin/schedules");
}

/* Constants for Selects */
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ["00", "15", "30", "45"];

/* Page Component */
export default function AdminScheduleForm() {
    const { schedule } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const isEdit = !!schedule;

    // Initial Values
    const defaultStartDate = schedule ? new Date(schedule.start_date) : new Date();
    const defaultEndDate = schedule ? new Date(schedule.end_date) : new Date();

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{isEdit ? "일정 수정" : "새 일정 등록"}</h1>
                <Button variant="outline" onClick={() => navigate("/admin/schedules")}>
                    목록으로
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Form method="post" className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">일정 제목 *</label>
                            <Input
                                name="title"
                                defaultValue={schedule?.title || ""}
                                placeholder="예: 2026 신년 이사회"
                                required
                            />
                        </div>

                        {/* Date Range with Time Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">시작 일시 *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        name="startDate"
                                        defaultValue={format(defaultStartDate, "yyyy-MM-dd")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    />
                                    <select
                                        name="startHour"
                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        defaultValue={format(defaultStartDate, "HH")}
                                    >
                                        {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                                    </select>
                                    <select
                                        name="startMinute"
                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        defaultValue={getMinutesRounded(defaultStartDate)}
                                    >
                                        {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">종료 일시 *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        name="endDate"
                                        defaultValue={format(defaultEndDate, "yyyy-MM-dd")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    />
                                    <select
                                        name="endHour"
                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        defaultValue={format(defaultEndDate, "HH")}
                                    >
                                        {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                                    </select>
                                    <select
                                        name="endMinute"
                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        defaultValue={getMinutesRounded(defaultEndDate)}
                                    >
                                        {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">장소</label>
                            <Input
                                name="location"
                                defaultValue={schedule?.location || ""}
                                placeholder="예: 302동 101호"
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">상세 내용</label>
                            <Textarea
                                name="content"
                                defaultValue={schedule?.content || ""}
                                placeholder="일정에 대한 상세 설명을 입력하세요."
                                className="min-h-[150px]"
                            />
                        </div>

                        {/* Options */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isImportant"
                                name="isImportant"
                                defaultChecked={schedule?.is_important || false}
                            />
                            <label htmlFor="isImportant" className="text-sm font-medium cursor-pointer">
                                중요 행사로 표시 (강조됨)
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg">
                                {isEdit ? "일정 수정" : "일정 등록"}
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper to round minutes to nearest quarter for default value
function getMinutesRounded(date: Date) {
    const m = date.getMinutes();
    if (m < 15) return "00";
    if (m < 30) return "15";
    if (m < 45) return "30";
    return "45";
}
