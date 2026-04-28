import { type Editor } from "@tiptap/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/utils";

interface FontFamilyToolbarProps {
    editor: Editor | null;
    className?: string;
    isMarkdownMode?: boolean;
}

const fonts = [
    { name: "Pretendard", value: "Pretendard", label: "Pretendard" },
    { name: "Libre Baskerville", value: "'Libre Baskerville', serif", label: "Libre Baskerville" },
];

export function FontFamilyToolbar({
    editor,
    className,
    isMarkdownMode,
}: FontFamilyToolbarProps) {
    if (!editor) {
        return null;
    }

    const currentFont = fonts.find((font) =>
        editor.isActive("textStyle", { fontFamily: font.value })
    );

    const handleFontChange = (value: string) => {
        if (value === "Pretendard") {
            editor.chain().focus().unsetFontFamily().run();
        } else {
            editor.chain().focus().setFontFamily(value).run();
        }
    };

    return (
        <Select
            value={currentFont?.value || "Pretendard"}
            onValueChange={handleFontChange}
            disabled={isMarkdownMode}
        >
            <SelectTrigger className={cn("h-8 w-[120px] gap-1 px-2 font-normal", className)}>
                <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent>
                {fonts.map((font) => (
                    <SelectItem
                        key={font.value}
                        value={font.value}
                        className="cursor-pointer"
                        style={{ fontFamily: font.value }}
                    >
                        {font.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
