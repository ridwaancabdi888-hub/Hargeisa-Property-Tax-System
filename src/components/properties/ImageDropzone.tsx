import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

export interface DropzoneImage {
  key: string;
  previewUrl: string;
  isUploading?: boolean;
}

interface ImageDropzoneProps {
  images: DropzoneImage[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (key: string) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function ImageDropzone({ images, onFilesSelected, onRemove, disabled }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateAndForward(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const invalidType = files.find((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalidType) {
      setValidationError(`"${invalidType.name}" is not a JPG, PNG, or WEBP image`);
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_SIZE_BYTES);
    if (tooLarge) {
      setValidationError(`"${tooLarge.name}" exceeds the 5MB size limit`);
      return;
    }

    setValidationError(null);
    onFilesSelected(files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (!disabled) validateAndForward(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDragOver ? "border-navy-700 bg-navy-50" : "border-slate-300 hover:bg-slate-50"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <ImagePlus size={20} className="text-slate-400" />
        <p className="text-xs font-medium text-slate-600">Drag & drop images here, or click to browse</p>
        <p className="text-[11px] text-slate-400">JPG, PNG, or WEBP — up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            validateAndForward(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {validationError && <p className="mt-1.5 text-xs text-red-600">{validationError}</p>}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((image) => (
            <div key={image.key} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
              <img src={image.previewUrl} alt="" className="h-full w-full object-cover" />
              {image.isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 size={16} className="animate-spin text-navy-700" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(image.key)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
