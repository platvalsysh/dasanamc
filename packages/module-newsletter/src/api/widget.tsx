import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "@repo/database";
import { FileService } from "@repo/module-file/server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit")) || 4;

    const items = await prisma.newsletters.findMany({
        take: limit,
        orderBy: { issue_number: 'desc' },
    });

    const itemsWithUrls = await Promise.all(items.map(async (item) => {
        const thumbUrl = await FileService.getPublicUrl(item.thumbnail_id);
        return {
            id: item.id,
            title: item.title,
            issue_number: item.issue_number,
            created_at: item.created_at,
            thumbUrl,
        };
    }));

    return { items: itemsWithUrls };
}
