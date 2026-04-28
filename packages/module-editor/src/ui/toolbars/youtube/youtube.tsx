import type { Editor } from "@tiptap/react";
import { Youtube as YoutubeIcon } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Button as UiButton,
} from "@repo/ui";
import { Button } from "../../../../components/tiptap-ui-primitive/button/button";

interface YoutubeToolbarProps {
  editor: Editor | null;
  isMarkdownMode?: boolean;
}

export function YoutubeToolbar({
  editor,
  isMarkdownMode,
}: YoutubeToolbarProps) {
  if (!editor) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");

  const onInsertYouTube = () => {
    if (url) {
      if (!editor) return;
      editor.commands.setYoutubeVideo({
        src: url,
      });
      setUrl("");
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          data-style="ghost"
          disabled={isMarkdownMode}
          tooltip="YouTube 동영상 삽입"
        >
          <YoutubeIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTube URL..."
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onInsertYouTube();
              }
            }}
          />
          <UiButton size="sm" className="h-8 px-2" onClick={onInsertYouTube}>
            Insert
          </UiButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
