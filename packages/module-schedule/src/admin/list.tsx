import { type ActionFunctionArgs, type LoaderFunctionArgs, Form, useLoaderData, Link } from "react-router";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@repo/ui-admin";
import { prisma } from "@repo/database";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Edit, Trash2, MapPin, Calendar as CalendarIcon } from "lucide-react";

/* Loader */
export async function loader({ request }: LoaderFunctionArgs) {
    const schedules = await prisma.schedules.findMany({
        orderBy: { start_date: "asc" }, // Future events first? Or all events? Let's show all for admin sorted by date
    });
    return { schedules };
}

/* Action for Delete */
export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const id = formData.get("id") as string;

    if (intent === "delete" && id) {
        await prisma.schedules.delete({ where: { id } });
    }
    return null;
}

export default function AdminScheduleList() {
    const { schedules } = useLoaderData<typeof loader>();

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">일정 관리</h1>
                    <p className="text-gray-500 mt-1">학부 및 동창회의 연간 주요 일정을 관리합니다.</p>
                </div>
                <Button asChild>
                    <Link to="new">새 일정 등록</Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">일시</TableHead>
                            <TableHead>행사명</TableHead>
                            <TableHead className="w-[150px]">장소</TableHead>
                            <TableHead className="w-[100px] text-center">상태</TableHead>
                            <TableHead className="w-[100px] text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                    등록된 일정이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules.map((schedule) => {
                                const isPast = new Date(schedule.end_date) < new Date();
                                return (
                                    <TableRow key={schedule.id} className={isPast ? "opacity-60 bg-gray-50" : ""}>
                                        <TableCell className="align-top py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-semibold text-gray-900">
                                                    {format(new Date(schedule.start_date), "yyyy.MM.dd (eee)", { locale: ko })}
                                                </span>
                                                <span className="text-gray-500 text-xs mt-0.5">
                                                    {format(new Date(schedule.start_date), "HH:mm")} ~ {format(new Date(schedule.end_date), "HH:mm")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-base truncate max-w-[300px]" title={schedule.title}>
                                                    {schedule.title}
                                                </span>
                                                {schedule.is_important && (
                                                    <span className="text-xs text-rose-500 font-semibold">• 중요 행사</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            {schedule.location ? (
                                                <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                    <MapPin size={13} />
                                                    <span className="truncate max-w-[120px]" title={schedule.location}>{schedule.location}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center align-top py-4">
                                            {isPast ? (
                                                <Badge variant="secondary" className="text-gray-500 bg-gray-200">종료됨</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-600 hover:bg-emerald-700">예정</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right align-top py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                    <Link to={`${schedule.id}`}>
                                                        <Edit size={16} />
                                                    </Link>
                                                </Button>
                                                <Form method="post" onSubmit={(e) => {
                                                    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) e.preventDefault();
                                                }}>
                                                    <input type="hidden" name="intent" value="delete" />
                                                    <input type="hidden" name="id" value={schedule.id} />
                                                    <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </Form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

