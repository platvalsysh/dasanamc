import React, { useState } from "react";
import type Uppy from "@uppy/core";
import { UploadCloud } from "lucide-react";

interface DropzoneProps {
  uppy: Uppy<any, any>;
}

export function Dropzone({ uppy }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      try {
        uppy.addFile({
          source: "react-dropzone",
          name: file.name,
          type: file.type,
          data: file,
        });
      } catch (err) {
        console.error("Failed to add file:", err);
      }
    });
  };

  const onClick = () => {
    // Trigger hidden file input if needed, or rely on a separate button.
    // Ideally the dropzone itself is clickable.
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach((file) => {
        try {
          uppy.addFile({
            source: "file-input",
            name: file.name,
            type: file.type,
            data: file,
          });
        } catch (err) {
          console.error(err);
        }
      });
    };
    input.click();
  };

  return (
    <div
      className={`file-upload-dropzone ${isDragging ? "is-dragging" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <div className="dropzone-content">
        <div className="dropzone-icon-wrapper">
          <UploadCloud className="w-8 h-8 text-gray-400" />
        </div>
        <div className="dropzone-text">
          <p className="primary-text">Click or drag files to upload</p>
          <p className="secondary-text">SVG, PNG, JPG or GIF (max. 20MB)</p>
        </div>
      </div>
    </div>
  );
}
