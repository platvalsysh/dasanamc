import { type ActionFunctionArgs, Link, useLoaderData, Form } from "react-router";
import { prisma } from "@repo/database";
import { Button } from "@repo/ui-admin";
import { Plus, Trash2, FileText, Image as ImageIcon, Pencil } from "lucide-react";
import { FileService } from "@repo/module-file/server";

export async function loader() {
    const items = await prisma.newsletters.findMany({
        orderBy: { issue_number: 'desc' },
        include: {
            files_newsletters_pdf_idTofiles: true,
            files_newsletters_thumbnail_idTofiles: true
        }
    });

    // Resolve public URLs for thumbnails
    const itemsWithUrls = await Promise.all(items.map(async (item) => {
        const thumbUrl = await FileService.getPublicUrl(item.thumbnail_id);
        return { ...item, thumbUrl };
    }));

    return { items: itemsWithUrls };
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const intent = formData.get("intent") as string;

    if (intent === "delete" && id) {
        const newsletter = await prisma.newsletters.findUnique({
            where: { id },
            include: {
                files_newsletters_pdf_idTofiles: true,
                files_newsletters_thumbnail_idTofiles: true
            }
        });

        if (newsletter) {
            // Delete files via FileService (handles S3 and DB deletion)
            await FileService.deleteFile(newsletter.pdf_id);
            await FileService.deleteFile(newsletter.thumbnail_id);

            // Finally delete newsletter record
            await prisma.newsletters.delete({ where: { id } });
        }
    }

    return null;
}

export default function NewsletterList() {
    const { items } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">동창회보 관리</h1>
                <Button asChild>
                    <Link to="new">
                        <Plus className="mr-2 h-4 w-4" />
                        신규 등록
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                        <tr>
                            <th className="px-4 py-3 w-20 text-center">회차</th>
                            <th className="px-4 py-3 w-24 text-center">썸네일</th>
                            <th className="px-4 py-3">제목</th>
                            <th className="px-4 py-3 text-center">PDF</th>
                            <th className="px-4 py-3 text-center w-24">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    등록된 동창회보가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center font-medium">
                                        제 {item.issue_number}호
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.thumbUrl ? (
                                            <img src={item.thumbUrl} alt="Cover" className="h-16 w-auto mx-auto border rounded shadow-sm object-cover" />
                                        ) : (
                                            <div className="h-16 w-12 mx-auto bg-gray-100 flex items-center justify-center rounded text-gray-400">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{item.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            등록일: {new Date(item.created_at || "").toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <FileText className="h-5 w-5 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">
                                                {(Number(item.files_newsletters_pdf_idTofiles.file_size) / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                                                <Link to={item.id}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Form method="post" onSubmit={(e) => {
                                                if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault();
                                            }}>
                                                <input type="hidden" name="id" value={item.id} />
                                                <input type="hidden" name="intent" value="delete" />
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </Form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
