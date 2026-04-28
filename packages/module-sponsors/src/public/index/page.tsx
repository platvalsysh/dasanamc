import { useLoaderData } from "react-router";
import { prisma } from "@repo/database";

import { PageHeader } from "@repo/ui";
import type { Route } from "./+types/page";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "후원기업 - 서울대학교 화학생물공학부 동창회" },
        {
            name: "description",
            content: "서울대학교 화학생물공학부 동창회 후원기업 목록입니다.",
        },
    ];
}

export async function loader() {
    const sponsors = await prisma.sponsors.findMany({
        where: { is_active: true },
        orderBy: { list_order: "asc" },
    });
    return { sponsors };
}

export default function SponsorsPage() {
    const { sponsors } = useLoaderData<typeof loader>();

    return (
        <div className="w-full">
            <PageHeader
                title="후원기업"
                description="서울대학교 화학생물공학부 동창회와 함께하는 후원기업을 소개합니다."
            />
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="group border border-gray-100 rounded-xl p-6 flex flex-col items-center justify-between hover:shadow-lg transition-all duration-300 bg-white min-h-[250px] relative overflow-hidden">
                            <div className="flex-1 flex items-center justify-center w-full p-4">
                                {sponsor.logo ? (
                                    <img
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        className="max-w-full max-h-32 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                            <span className="text-2xl font-bold text-gray-200">?</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-center w-full z-10">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{sponsor.name}</h3>
                                {sponsor.url && (
                                    <a
                                        href={sponsor.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block mt-2 text-sm text-gray-500 hover:text-primary transition-colors underline underline-offset-4"
                                    >
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {sponsors.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">등록된 후원기업이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
