import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, Form, useNavigation, Link, useLoaderData } from "react-router";
import { prisma } from "@repo/database";
import { Button, Input, Label } from "@repo/ui-admin";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useSupabase } from "@repo/auth/ui";
import { X, Upload, Loader2, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { FileService } from "@repo/module-file/server";
// pdfjs-dist import moved to dynamic import to avoid SSR 'DOMMatrix' error

export async function loader({ params }: LoaderFunctionArgs) {
    if (!params.id) return { newsletter: null };

    const newsletter = await prisma.newsletters.findUnique({
        where: { id: params.id },
        include: {
            files_newsletters_pdf_idTofiles: true,
            files_newsletters_thumbnail_idTofiles: true
        }
    });

    if (!newsletter) {
        throw new Response("Not Found", { status: 404 });
    }

    const thumbUrl = await FileService.getPublicUrl(newsletter.thumbnail_id);
    // Since PDF might not be viewable directly or we just need metadata, getting URL is fine
    // But for FileUploader preview, we mainly need the name/size. 
    // We can pass the derived previewUrl via FileService if needed, but for files usually name is enough.

    return {
        newsletter,
        thumbUrl
    };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent"); // 'create' or 'update'
    const id = params.id;

    const title = formData.get("title") as string;
    const issue_number = parseInt(formData.get("issue_number") as string, 10);

    // PDF Info
    const pdf_action = formData.get("pdf_action") as string; // 'new' | 'keep'
    const pdf_path = formData.get("pdf_path") as string;
    const pdf_name = formData.get("pdf_name") as string;
    const pdf_size = parseInt(formData.get("pdf_size") as string, 10);
    const pdf_type = formData.get("pdf_type") as string;
    const pdf_bucket = formData.get("pdf_bucket") as string;

    // Thumbnail Info
    const thumb_action = formData.get("thumb_action") as string; // 'new' | 'keep'
    const thumb_path = formData.get("thumb_path") as string;
    const thumb_name = formData.get("thumb_name") as string;
    const thumb_size = parseInt(formData.get("thumb_size") as string, 10);
    const thumb_type = formData.get("thumb_type") as string;
    const thumb_bucket = formData.get("thumb_bucket") as string;

    // Validation
    if ((!id && pdf_action !== 'new') || (!id && thumb_action !== 'new')) {
        // Create mode requires files
        // Ideally we return errors here, but for now throwing
        // throw new Error("Files are required");
    }

    const oldFilesToDelete: string[] = [];

    await prisma.$transaction(async (tx) => {
        let pdfId = undefined;
        let thumbId = undefined;

        // Handle PDF
        if (pdf_action === 'new') {
            const pdfFile = await tx.files.create({
                data: {
                    module: "newsletter",
                    original_name: pdf_name,
                    file_size: pdf_size,
                    mime_type: pdf_type,
                    extension: pdf_name.split('.').pop()?.toLowerCase(),
                    storage_type: "s3",
                    s3_bucket: pdf_bucket,
                    s3_key: pdf_path,
                    status: "U",
                    is_publish: true,
                }
            });
            pdfId = pdfFile.id;
        }

        // Handle Thumbnail
        if (thumb_action === 'new') {
            const thumbFile = await tx.files.create({
                data: {
                    module: "newsletter",
                    original_name: thumb_name,
                    file_size: thumb_size,
                    mime_type: thumb_type,
                    extension: thumb_name.split('.').pop()?.toLowerCase(),
                    storage_type: "s3",
                    s3_bucket: thumb_bucket,
                    s3_key: thumb_path,
                    status: "U",
                    is_publish: true,
                }
            });
            thumbId = thumbFile.id;
        }

        if (id) {
            // UPDATE
            const current = await tx.newsletters.findUnique({ where: { id } });
            if (!current) throw new Error("Newsletter not found");

            // Check if we need to delete old files (only if replaced)
            if (pdfId && current.pdf_id !== pdfId) {
                oldFilesToDelete.push(current.pdf_id);
            }
            if (thumbId && current.thumbnail_id !== thumbId) {
                oldFilesToDelete.push(current.thumbnail_id);
            }

            await tx.newsletters.update({
                where: { id },
                data: {
                    title,
                    issue_number,
                    ...(pdfId ? { pdf_id: pdfId } : {}),
                    ...(thumbId ? { thumbnail_id: thumbId } : {})
                }
            });
        } else {
            // CREATE
            // Ensure IDs are present for create
            if (!pdfId || !thumbId) throw new Error("Both files are required for new entries");

            await tx.newsletters.create({
                data: {
                    title,
                    issue_number,
                    pdf_id: pdfId,
                    thumbnail_id: thumbId
                }
            });
        }
    });

    // Delete old files after successful transaction (to avoid FK constraints during update)
    if (oldFilesToDelete.length > 0) {
        await Promise.all(oldFilesToDelete.map(id => FileService.deleteFile(id).catch(e => console.error("Failed to cleanup file", id, e))));
    }

    return redirect("/admin/newsletters");
}

interface FileUploaderHandle {
    uploadFile: (file: File | Blob) => Promise<void>;
}

interface FileUploaderProps {
    name: string;
    label: string;
    accept: string;
    bucket: string;
    icon?: React.ReactNode;
    initialFile?: {
        name: string;
        size: number;
        url?: string | null;
    } | null;
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(({ name, label, accept, bucket, icon, initialFile, onFileSelect }, ref) => {
    const [fileInfo, setFileInfo] = useState<{
        path: string;
        name: string;
        size: number;
        type: string;
        previewUrl?: string | null;
    } | null>(null);
    const [status, setStatus] = useState<'none' | 'keep' | 'new'>('none');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const supabase = useSupabase();

    useEffect(() => {
        if (initialFile) {
            setFileInfo({
                path: "", // Path not needed for 'keep' status
                name: initialFile.name,
                size: initialFile.size,
                type: "", // Type not critical for display
                previewUrl: initialFile.url
            });
            setStatus('keep');
        }
    }, [initialFile]);

    const performUpload = async (file: File | Blob) => {
        setIsUploading(true);
        try {
            const fileNameStr = (file instanceof File) ? file.name : "thumbnail.png";
            // For Blob (generated thumbnail), generic name if not File, but we usually pass File or we can construct name.
            // If it's a blob without name property, we make one up if needed, but 'file.name' check handles File.

            const fileExt = fileNameStr.split('.').pop() || "png";
            const randomName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `newsletter/${randomName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            let previewUrl: string | undefined;
            // Basic check for image to show preview
            if (file.type.startsWith('image/') || fileExt.toLowerCase() === 'png' || fileExt.toLowerCase() === 'jpg') {
                const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
                previewUrl = data.publicUrl;
            }

            setFileInfo({
                path: filePath,
                name: fileNameStr,
                size: file.size,
                type: file.type,
                previewUrl
            });
            setStatus('new');
        } catch (error) {
            console.error("Upload error:", error);
            alert("업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        uploadFile: performUpload
    }));

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (onFileSelect && file instanceof File) {
            onFileSelect(file);
        }

        await performUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Check file type if accept matches simple patterns (optional improvement)
        // For now trusting user or backend/supabase

        if (onFileSelect && file instanceof File) {
            onFileSelect(file);
        }

        await performUpload(file);
    };

    const handleRemove = () => {
        setFileInfo(null);
        setStatus('none');
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <input type="hidden" name={`${name}_action`} value={status} />
            <input type="hidden" name={`${name}_path`} value={fileInfo?.path || ""} />
            <input type="hidden" name={`${name}_name`} value={fileInfo?.name || ""} />
            <input type="hidden" name={`${name}_size`} value={fileInfo?.size || 0} />
            <input type="hidden" name={`${name}_type`} value={fileInfo?.type || ""} />
            <input type="hidden" name={`${name}_bucket`} value={bucket} />

            {fileInfo ? (
                <div className="relative inline-flex items-center gap-4 p-4 border bg-gray-50 pr-12 w-full shadow-none">
                    {fileInfo.previewUrl ? (
                        <img src={fileInfo.previewUrl} alt="Preview" className="h-12 w-12 object-cover bg-white border" />
                    ) : (
                        <div className="p-2 bg-white border text-gray-500">
                            {icon || <FileIcon size={24} />}
                        </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{fileInfo.name}</span>
                        <span className="text-xs text-gray-500">{(Number(fileInfo.size) / 1024 / 1024).toFixed(2)} MB {status === 'keep' && "(기존 파일)"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed p-6 transition-colors cursor-pointer text-center \${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    onClick={() => !isUploading && document.getElementById(name + '-input')?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id={name + '-input'}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <div className="p-3 bg-gray-100 text-gray-400">
                            {isUploading ? <Loader2 size={24} className="animate-spin" /> : (icon || <Upload size={24} />)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                            {isUploading ? "업로드 중..." : `${label} 업로드`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
FileUploader.displayName = "FileUploader";

export default function NewsletterForm() {
    const { newsletter, thumbUrl } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const isEdit = !!newsletter;

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const initialPdfFile = useRef(newsletter ? {
        name: newsletter.files_newsletters_pdf_idTofiles.original_name,
        size: Number(newsletter.files_newsletters_pdf_idTofiles.file_size)
    } : null).current;

    const initialThumbFile = useRef(newsletter ? {
        name: newsletter.files_newsletters_thumbnail_idTofiles.original_name,
        size: Number(newsletter.files_newsletters_thumbnail_idTofiles.file_size),
        url: thumbUrl
    } : null).current;

    const thumbUploaderRef = useRef<FileUploaderHandle>(null);

    const handleExtractThumbnail = async () => {
        if (!pdfFile) return;

        setIsGenerating(true);
        try {
            // Load the PDF file
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }

            const arrayBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                cMapUrl: '/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: '/standard_fonts/',
                wasmUrl: window.location.origin + '/',
            });
            const pdf = await loadingTask.promise;

            // Get the first page
            const page = await pdf.getPage(1);
            const scale = 1.0;
            const viewport = page.getViewport({ scale });

            // Render to canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error("Canvas context not available");

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            } as any).promise;

            // Convert to Blob
            const blob = await new Promise<Blob | null>(resolve =>
                canvas.toBlob(resolve, 'image/png')
            );

            if (!blob) throw new Error("Thumbnail generation failed");

            // Convert Blob to File to have a name
            const thumbFile = new File([blob], "thumbnail.png", { type: "image/png" });

            // Upload via ref
            if (thumbUploaderRef.current) {
                await thumbUploaderRef.current.uploadFile(thumbFile);
            }
        } catch (e) {
            console.error("Thumbnail extraction error:", e);
            alert("썸네일 추출 중 오류가 발생했습니다: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8 bg-white border border-gray-200 mt-8 mb-8 shadow-none">
            <h1 className="text-2xl font-bold">{isEdit ? "동창회보 수정" : "동창회보 등록"}</h1>

            <Form method="post" className="space-y-6">
                <input type="hidden" name="intent" value={isEdit ? "update" : "create"} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="issue_number">회차 (호)</Label>
                        <Input
                            id="issue_number"
                            name="issue_number"
                            type="number"
                            required
                            placeholder="예: 28"
                            defaultValue={newsletter?.issue_number}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="예: 2024년 가을호"
                            defaultValue={newsletter?.title}
                        />
                    </div>
                </div>

                <div className="space-y-6 pt-4 border-t">
                    <div className="space-y-4">
                        <FileUploader
                            name="pdf"
                            label="PDF 파일"
                            accept="application/pdf"
                            bucket="module-newsletter"
                            icon={<FileIcon size={24} />}
                            onFileSelect={setPdfFile}
                            initialFile={initialPdfFile}
                        />

                        {pdfFile && (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleExtractThumbnail}
                                    disabled={isGenerating}
                                >
                                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    첫 페이지로 썸네일 자동 생성
                                </Button>
                            </div>
                        )}
                    </div>

                    <FileUploader
                        ref={thumbUploaderRef}
                        name="thumb"
                        label="썸네일 이미지"
                        accept="image/*"
                        bucket="module-newsletter"
                        icon={<ImageIcon size={24} />}
                        initialFile={initialThumbFile}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t">
                    <Button asChild variant="outline">
                        <Link to="/admin/newsletters">취소</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "처리 중..." : (isEdit ? "수정하기" : "등록하기")}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
