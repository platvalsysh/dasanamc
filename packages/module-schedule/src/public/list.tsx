import { prisma } from "@repo/database";
import { PageHeader } from "@repo/ui";
import { cn } from "@repo/ui/utils";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";

/* Loader */
export async function loader({ request }: LoaderFunctionArgs) {
    const today = new Date();
    // Fetch all current and future schedules
    // Optionally we can fetch past schedules of this year too, depending on requirements.
    // Let's fetch whole current year + next year for "Annual Schedule" feel.
    // Actually, "Annual Schedule" usually means showing the whole timeline of the year.
    // Let's fetch everything sorted by date.

    const schedules = await prisma.schedules.findMany({
        orderBy: { start_date: "asc" },
    });

    return { schedules };
}

/* Utils for ICS Generation */
function generateGoogleCalendarUrl(event: any) {
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatDate(new Date(event.start_date));
    const end = formatDate(new Date(event.end_date));

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${start}/${end}`,
        details: event.content || "",
        location: event.location || "",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(event: any) {
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SNU ChemEng Alumni//Schedule//KO",
        "BEGIN:VEVENT",
        `UID:${event.id}@chemeng.snu.ac.kr`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(new Date(event.start_date))}`,
        `DTEND:${formatDate(new Date(event.end_date))}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.content || ""}`,
        `LOCATION:${event.location || ""}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


export default function PublicScheduleList() {
    const { schedules } = useLoaderData<typeof loader>();

    // Group by Month
    const schedulesByMonth: Record<string, typeof schedules> = {};
    schedules.forEach(s => {
        const monthKey = format(new Date(s.start_date), "yyyy-MM");
        if (!schedulesByMonth[monthKey]) schedulesByMonth[monthKey] = [];
        schedulesByMonth[monthKey].push(s);
    });

    const months = Object.keys(schedulesByMonth).sort();

    return (
        <div className="w-full">
            <PageHeader
                title="연간 일정"
                description="동창회의 주요 행사 일정을 안내해 드립니다."
            >
                <a
                    href="/schedules/download.ics"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm transition-colors text-sm font-medium"
                >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    전체 일정 다운로드 (ICS)
                </a>
            </PageHeader>

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                {/* Year Timeline / Navigation could go here */}

                <div className="space-y-16">
                    {months.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            등록된 일정이 없습니다.
                        </div>
                    ) : (
                        months.map(monthKey => {
                            const monthSchedules = schedulesByMonth[monthKey];
                            const [year, month] = monthKey.split("-");

                            return (
                                <section key={monthKey} className="relative">
                                    {/* Month Header - Sticky Effect Optional */}
                                    <div className="flex items-baseline gap-4 mb-6 border-b-2 border-slate-900 pb-2">
                                        <h2 className="text-4xl font-bold text-slate-900">{parseInt(month)}월</h2>
                                        <span className="text-xl text-slate-500 font-light">{year}년</span>
                                    </div>

                                    {/* Schedule Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {monthSchedules.map(schedule => {
                                            const isPast = new Date(schedule.end_date) < new Date();
                                            const isMultiDay = !isSameDay(new Date(schedule.start_date), new Date(schedule.end_date));

                                            return (
                                                <div
                                                    key={schedule.id}
                                                    className={cn(
                                                        "group relative bg-white border border-gray-200 rounded-lg p-5 transition-all hover:shadow-md flex flex-col md:flex-row gap-6",
                                                        isPast && "opacity-60 grayscale-[50%] bg-gray-50"
                                                    )}
                                                >
                                                    {/* Date Box */}
                                                    <div className="md:w-32 flex flex-col justify-center items-center bg-slate-50 rounded border border-slate-100 p-3 text-center shrink-0">
                                                        <span className="text-sm font-medium text-slate-500">
                                                            {format(new Date(schedule.start_date), "eee", { locale: ko })}
                                                        </span>
                                                        <span className="text-3xl font-bold text-slate-800 my-1">
                                                            {format(new Date(schedule.start_date), "dd")}
                                                        </span>
                                                        {isMultiDay && (
                                                            <div className="text-xs text-slate-400 mt-1">
                                                                ~ {format(new Date(schedule.end_date), "MM.dd")}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {schedule.is_important && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                                                                    중요
                                                                </span>
                                                            )}
                                                            {isPast && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    종료
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                                            {schedule.title}
                                                        </h3>

                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600 mt-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>
                                                                    {format(new Date(schedule.start_date), "HH:mm")}
                                                                    {!isMultiDay && ` ~ ${format(new Date(schedule.end_date), "HH:mm")}`}
                                                                </span>
                                                            </div>
                                                            {schedule.location && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                                    <span>{schedule.location}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {schedule.content && (
                                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                                                {schedule.content}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons (Right Side on Desktop) */}
                                                    <div className="md:w-40 flex flex-row md:flex-col justify-center items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                        <a
                                                            href={generateGoogleCalendarUrl(schedule)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 md:flex-none w-full text-xs font-medium px-3 py-2 bg-white border border-gray-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                            구글 캘린더
                                                        </a>
                                                        <button
                                                            onClick={() => downloadIcsFile(schedule)}
                                                            className="flex-1 md:flex-none w-full text-xs font-medium px-3 py-2 bg-white border border-gray-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Calendar className="w-3 h-3 text-slate-500" />
                                                            내 캘린더 저장
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

