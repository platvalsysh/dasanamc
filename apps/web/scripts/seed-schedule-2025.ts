import { prisma } from "@repo/database";

// const prisma = new PrismaClient(); // Removed, using imported instance

const schedules = [
    // 2025 Events
    {
        title: "춘계 골프 모임",
        start_date: new Date("2025-05-31T06:00:00"),
        end_date: new Date("2025-05-31T14:00:00"),
        location: "뉴스프링빌cc, 이천",
        content: "2025년 춘계 골프 모임",
        is_important: false,
    },
    {
        title: "제8차 동문 자녀 공학 캠프",
        start_date: new Date("2025-08-12T09:00:00"),
        end_date: new Date("2025-08-12T17:00:00"),
        location: "서울대 302동",
        content: "동문 자녀를 위한 제8차 공학 캠프",
        is_important: false,
    },
    {
        title: "하계 졸업식",
        start_date: new Date("2025-08-28T14:00:00"),
        end_date: new Date("2025-08-28T16:00:00"),
        location: "서울대 302동",
        content: "2025학년도 하계 졸업식",
        is_important: false,
    },
    {
        title: "추계 골프 모임",
        start_date: new Date("2025-09-20T06:00:00"),
        end_date: new Date("2025-09-20T14:00:00"),
        location: "미정",
        content: "2025년 추계 골프 모임 (장소 미정)",
        is_important: false,
    },
    {
        title: "제4차 Job Fair",
        start_date: new Date("2025-10-23T10:00:00"),
        end_date: new Date("2025-10-23T17:00:00"),
        location: "서울대 302동",
        content: "제4차 화학생물공학부 Job Fair",
        is_important: true,
    },
    {
        title: "추계 등반 모임",
        start_date: new Date("2025-11-08T09:00:00"),
        end_date: new Date("2025-11-08T13:00:00"),
        location: "관악산 예정",
        content: "공대 홈커밍데이와 함께 진행되는 추계 등반 모임",
        is_important: false,
    },
    {
        title: "추계 정기 총회 & 송년회",
        start_date: new Date("2025-11-11T18:00:00"),
        end_date: new Date("2025-11-11T21:00:00"),
        location: "서울 더플라자호텔 예정",
        content: "2025년 추계 정기 총회 및 송년회",
        is_important: true,
    },

    // 2026 Events
    {
        title: "동계 졸업식 (일정 미정)",
        start_date: new Date("2026-02-01T14:00:00"),
        end_date: new Date("2026-02-01T16:00:00"),
        location: "서울대 302동",
        content: "2025학년도 동계 졸업식 (2월 중 예정)",
        is_important: false,
    },
    {
        title: "춘계총회 및 동창회보 발간",
        start_date: new Date("2026-04-14T18:00:00"),
        end_date: new Date("2026-04-14T21:00:00"),
        location: "서울 더플라자호텔 예정",
        content: "2026년 춘계총회 및 동창회보 발간 기념식",
        is_important: true,
    },
];

async function main() {
    console.log("Start seeding schedules...");
    for (const schedule of schedules) {
        await prisma.schedules.create({
            data: schedule,
        });
        console.log(`Created: ${schedule.title}`);
    }
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
