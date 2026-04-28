import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { prisma } from "@repo/database";
import { FileService } from "@repo/module-file/server";
import { PdfViewer } from "@repo/ui/components/ui/pdf-viewer";
import { useEffect } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
    if (!params.id) throw new Response("Not Found", { status: 404 });

    const newsletter = await prisma.newsletters.findUnique({
        where: { id: params.id },
        include: {
            files_newsletters_pdf_idTofiles: true
        }
    });

    if (!newsletter) {
        throw new Response("Not Found", { status: 404 });
    }

    const pdfUrl = FileService.getStoragePublicUrl(newsletter.files_newsletters_pdf_idTofiles);

    return {
        newsletter,
        pdfUrl
    };
}

export default function PublicNewsletterView() {
    const { newsletter, pdfUrl } = useLoaderData<typeof loader>();

    useEffect(() => {
        // Prevent body scrolling when this page is mounted
        document.body.style.overflow = "hidden";
        // Also hide header if possible by z-index or other means if needed, 
        // but typically overflow:hidden on body is enough for full screen feeling 
        // if the container is fixed.

        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    // Use flex column to fill remaining space.
    // Assuming standard header height is around 64px (h-16).
    return (
        <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-white">
            <PdfViewer
                url={pdfUrl}
                title={newsletter.title}
                className="flex-1 w-full h-full border-0 rounded-none shadow-none"
            />
        </div>
    );
}
