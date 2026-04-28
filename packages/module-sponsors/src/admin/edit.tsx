
import { type ActionFunctionArgs, redirect, Form, useLoaderData, useNavigation, Link } from "react-router";
import { prisma } from "@repo/database";
import { Button, Input, Label, Textarea } from "@repo/ui-admin";
import { useState } from "react";
import { useSupabase } from "@repo/auth/ui";
import { X, Upload, Loader2 } from "lucide-react";
import { supabaseAdmin } from "@repo/module-file/server";

export async function loader({ params }: { params: { id: string } }) {
    const sponsor = await prisma.sponsors.findUnique({
        where: { id: params.id },
    });

    if (!sponsor) {
        throw new Response("Sponsor not found", { status: 404 });
    }

    return { sponsor };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        const sponsor = await prisma.sponsors.findUnique({
            where: { id: params.id },
        });

        if (sponsor?.logo) {
            // Attempt to delete logo from storage
            // Extract path from public URL if possible, or assume simple structure if matches our direct upload pattern.
            // Our pattern: https://.../public-images/module-sponsors/filename
            // But we stored the Full URL.
            // So we need to parse it or just try to delete by filename if we can extra it.
            // Or better, we can use the server-side supabase client to delete it.

            try {
                // supabaseAdmin is already imported
                const urlParts = sponsor.logo.split('/');
                const fileName = urlParts[urlParts.length - 1]; // Simple extraction

                if (fileName) {
                    await supabaseAdmin.storage
                        .from('module-sponsors')
                        .remove([fileName]);
                }
            } catch (e) {
                console.error("Failed to delete image from storage:", e);
                // Continue to delete record even if image deletion fails
            }

            await prisma.sponsors.delete({
                where: { id: params.id },
            });

            return redirect("/admin/sponsors");
        }
    }

    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as string;

    await prisma.sponsors.update({
        where: { id: params.id },
        data: {
            name,
            url,
            description,
            logo,
        },
    });

    return redirect("/admin/sponsors");
}

interface FileUploaderProps {
    name: string;
    defaultValue?: string;
    className?: string;
    accept?: string;
}

function FileUploader({
    name,
    defaultValue,
    className,
    accept = "image/*",
}: FileUploaderProps) {
    const [preview, setPreview] = useState<string | null>(defaultValue || null);
    const [finalValue, setFinalValue] = useState<string>(defaultValue || "");
    const [isUploading, setIsUploading] = useState(false);
    const supabase = useSupabase();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('module-sponsors')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('module-sponsors')
                .getPublicUrl(filePath);

            setFinalValue(data.publicUrl);

            if (!file.type.startsWith('image/')) {
                setPreview(null);
            } else {
                setPreview(data.publicUrl);
            }

        } catch (error) {
            console.error("Upload error:", error);
            alert("이미지 업로드에 실패했습니다.");
            setPreview(defaultValue || null);
            setFinalValue(defaultValue || "");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setFinalValue("");
    };

    return (
        <div className={className}>
            <input type="hidden" name={name} value={finalValue || defaultValue || ""} />

            <div className="space-y-4">
                {preview ? (
                    <div className="relative inline-block border rounded-lg overflow-hidden group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-40 w-auto object-contain bg-white"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={16} />
                        </button>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-white text-xs font-medium">Remove</span>
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 hover:bg-gray-50 transition-colors text-center cursor-pointer relative" onClick={() => !isUploading && document.getElementById(name + '-input')?.click()}>
                        <Input
                            id={name + '-input'}
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <div className="p-3 bg-gray-100 rounded-full text-gray-400">
                                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                                {isUploading ? "업로드 중..." : "클릭하여 이미지 업로드"}
                            </div>
                            <div className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EditSponsor() {
    const { sponsor } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">후원기업 수정</h1>
                <Form method="post" onSubmit={(e) => {
                    if (!confirm("정말 삭제하시겠습니까?")) e.preventDefault();
                }}>
                    <input type="hidden" name="intent" value="delete" />
                    <Button type="submit" variant="destructive">
                        삭제
                    </Button>
                </Form>
            </div>

            <Form method="post" className="space-y-6">
                <input type="hidden" name="intent" value="update" />
                <div className="space-y-2">
                    <Label htmlFor="name">사명</Label>
                    <Input id="name" name="name" required placeholder="기업명 입력" defaultValue={sponsor.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">홈페이지 주소</Label>
                    <Input id="url" name="url" type="url" placeholder="https://..." defaultValue={sponsor.url || ""} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo">로고 이미지</Label>
                    <FileUploader name="logo" defaultValue={sponsor.logo || undefined} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">비고</Label>
                    <Textarea id="description" name="description" placeholder="메모할 내용" defaultValue={sponsor.description || ""} />
                </div>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link to="/admin/sponsors">취소</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "수정 중..." : "수정하기"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
