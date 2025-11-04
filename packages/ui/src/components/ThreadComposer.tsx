import * as React from "react";
import { clsx } from "clsx";

export interface ThreadComposerProps {
  onSubmit: (content: string, media?: File[]) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function ThreadComposer({
  onSubmit,
  placeholder = "What's on your mind?",
  maxLength = 500,
  className,
}: ThreadComposerProps) {
  const [content, setContent] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, files);
      setContent("");
      setFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const remaining = maxLength - content.length;

  return (
    <form onSubmit={handleSubmit} className={clsx("rounded-lg bg-white p-4 shadow-md", className)}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none border-0 bg-transparent text-[#2C2C2C] placeholder-gray-400 focus:outline-none"
        rows={4}
      />

      {files.length > 0 && (
        <div className="mb-3 flex gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="relative">
              <span className="rounded bg-[#D9C8A0] px-2 py-1 text-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                className="ml-1 text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="flex gap-2">
          <label className="cursor-pointer rounded p-2 hover:bg-gray-100">
            <span>📷</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button type="button" className="rounded p-2 hover:bg-gray-100">
            🎤
          </button>
          <button type="button" className="rounded p-2 hover:bg-gray-100">
            📊
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={clsx("text-sm", {
              "text-gray-500": remaining > 50,
              "text-yellow-600": remaining <= 50 && remaining > 0,
              "text-red-500": remaining <= 0,
            })}
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!content.trim() || remaining < 0}
            className="rounded-lg bg-[#0D2C56] px-4 py-2 text-white transition-colors hover:bg-[#1a3d6f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
}
