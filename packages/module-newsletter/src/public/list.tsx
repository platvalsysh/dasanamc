import { Link, useLoaderData } from "react-router";
import { PageHeader } from "@repo/ui";
import { prisma } from "@repo/database";
import { FileService } from "@repo/module-file/server";

export async function loader() {
    const items = await prisma.newsletters.findMany({
        orderBy: { issue_number: 'desc' },
        include: {
            files_newsletters_thumbnail_idTofiles: true
        }
    });

    const itemsWithUrls = await Promise.all(items.map(async (item) => {
        const thumbUrl = await FileService.getPublicUrl(item.thumbnail_id);
        return { ...item, thumbUrl };
    }));

    return { items: itemsWithUrls };
}

export default function PublicNewsletterList() {
    const { items } = useLoaderData<typeof loader>();

    return (
        <div className="w-full">
            <PageHeader
                title="동창회보"
                description="동창회 소식과 활동을 매거진 형태로 전해드립니다."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {items.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-gray-50 rounded-lg">
                            등록된 동창회보가 없습니다.
                        </div>
                    ) : (
                        items.map((item) => (
                            <Link
                                key={item.id}
                                to={`${item.id}/view`}
                                className="group flex flex-col items-center"
                            >
                                <div className="w-full aspect-[1/1.4] bg-gray-100 rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-200 group-hover:shadow-md transition-shadow relative">
                                    {item.thumbUrl ? (
                                        <img
                                            src={item.thumbUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded mb-2">
                                        제{item.issue_number}호
                                    </span>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(item.created_at || "").getFullYear()}년
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
