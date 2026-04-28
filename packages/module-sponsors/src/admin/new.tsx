import { redirect, Form, useNavigation, Link } from "react-router";
import { prisma } from "@repo/database";
import { Button, Input, Label, Textarea } from "@repo/ui-admin";
import { useState } from "react";
import { useSupabase } from "@repo/auth/ui";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";


export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as string;

    await prisma.sponsors.create({
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

        // Show local preview immediately if image
        if (file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload directly to Supabase 'module-sponsors' bucket
            const { error: uploadError } = await supabase.storage
                .from('module-sponsors')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage
                .from('module-sponsors')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            setFinalValue(publicUrl);

            // Allow time for Supabase to propagate or just trust the local preview/URL
            if (file.type.startsWith('image/')) {
                // Keep local preview as it's faster, or switch to remote
                // setPreview(publicUrl); 
            }

        } catch (error) {
            console.error("Upload error:", error);
            alert("이미지 업로드에 실패했습니다. 'module-sponsors' 버킷이 존재하고 공개 권한이 있는지 확인해주세요.");
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
            <input type="hidden" name={name} value={finalValue} />

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
                {finalValue && !preview && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                        <ImageIcon size={16} />
                        파일이 업로드되었습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NewSponsor() {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">후원기업 등록</h1>

            <Form method="post" className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">사명</Label>
                    <Input id="name" name="name" required placeholder="기업명 입력" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">홈페이지 주소</Label>
                    <Input id="url" name="url" type="url" placeholder="https://..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo">로고 이미지</Label>
                    <FileUploader name="logo" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">비고</Label>
                    <Textarea id="description" name="description" placeholder="메모할 내용" />
                </div>

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link to="/admin/sponsors">취소</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "등록 중..." : "등록하기"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
