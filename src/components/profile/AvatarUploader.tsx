import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface AvatarUploaderProps {
  avatarUrl: string | null;
  initials: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function AvatarUploader({ avatarUrl, initials, onUpload, onRemove }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be 5MB or smaller");
      return;
    }
    setError(null);
    setIsBusy(true);
    try {
      await onUpload(file);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove() {
    setIsBusy(true);
    try {
      await onRemove();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group relative h-14 w-14 shrink-0">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-navy-950 text-lg font-semibold text-white">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          aria-label="Change profile picture"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 text-white opacity-0 transition-opacity group-hover:bg-slate-900/50 group-hover:opacity-100"
        >
          {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {avatarUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isBusy}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
        >
          <X size={11} /> Remove photo
        </button>
      )}
      {error && <p className="max-w-[120px] text-center text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
