import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { imageUrl } from '@/lib/services';
import { cn } from '@/lib/utils';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

const MAX_FILE_MB = 10;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured for uploads.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Upload failed');
  }
  const data = await res.json();
  return data.public_id as string;
}

interface CloudinaryUploaderProps {
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Uploads straight from the browser to Cloudinary's unsigned endpoint — no
 * backend involved, safe because the upload preset (not a secret key) is
 * what authorises it. Stores the Cloudinary public_id, not the delivery
 * URL, so `imageUrl()` can keep applying transforms (auto format/quality,
 * responsive width) the way it already does for every other product image.
 */
export function CloudinaryUploader({ value, onChange }: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);

    const tooBig = list.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    const ok = list.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
    if (tooBig.length > 0) {
      toast.error(`${tooBig.length} file${tooBig.length === 1 ? '' : 's'} over ${MAX_FILE_MB}MB skipped`);
    }
    if (ok.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.allSettled(ok.map(uploadToCloudinary));
      const uploaded = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);
      const failed = results.length - uploaded.length;
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
      if (failed > 0) toast.error(`${failed} image${failed === 1 ? '' : 's'} failed to upload`);
    } finally {
      setUploading(false);
    }
  };

  const remove = (publicId: string) => onChange(value.filter((id) => id !== publicId));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((publicId) => (
          <div
            key={publicId}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-hairline bg-surface-sunk"
          >
            <img
              src={imageUrl(publicId, { width: 160 }) ?? undefined}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(publicId)}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-cream opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload images"
          className={cn(
            'grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-dashed border-hairline text-ink-faint transition-colors hover:border-[hsl(var(--accent-ink))] hover:text-[hsl(var(--accent-ink))]',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="mt-2 text-xs text-ink-faint">
        Up to {MAX_FILE_MB}MB per image. The first photo is used as the product&rsquo;s main image.
      </p>
    </div>
  );
}
