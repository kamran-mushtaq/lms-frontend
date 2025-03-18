"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import Image from 'next/image';

interface FileUploadProps {
  onChange: (file?: File) => void;
  value?: File;
}

export function FileUpload({ onChange, value }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onChange(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    multiple: false
  });

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="flex flex-col gap-4">
          <div className="relative h-48 w-full border rounded-md overflow-hidden bg-gray-50">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onChange(undefined);
              setPreview(null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Remove Photo
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? "border-primary bg-primary/10" : "border-muted"}`}
        >
          <Input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground">
              {isDragActive ? (
                <>Drop the photo here</>
              ) : (
                <>Drag & drop photo here, or click to select</>
              )}
            </span>
            <Button type="button" variant="outline" size="sm">
              Browse Files
            </Button>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Recommended size: 800x600 pixels (max 5MB)
      </p>
    </div>
  );
}
