import { type LoaderFunctionArgs } from "react-router";
import { prisma } from "@repo/database";

export async function loader({ request }: LoaderFunctionArgs) {
    const schedules = await prisma.schedules.findMany({
        orderBy: { start_date: "asc" },
    });

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const events = schedules.map(event => {
        return [
            "BEGIN:VEVENT",
            `UID:${event.id}@chemeng.snu.ac.kr`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(new Date(event.start_date))}`,
            `DTEND:${formatDate(new Date(event.end_date))}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.content || ""}`,
            `LOCATION:${event.location || ""}`,
            "END:VEVENT"
        ].join("\r\n");
    }).join("\r\n");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SNU ChemEng Alumni//Schedule//KO",
        "X-WR-CALNAME:서울대 화학생물공학부 동창회 일정",
        events,
        "END:VCALENDAR"
    ].join("\r\n");

    return new Response(icsContent, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="snu_chemeng_schedules.ics"',
        },
    });
}
