"use client";

import { type ChangeEvent, type DragEvent, useId, useState } from "react";
import { CheckCircle2, ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

type UploadFolder = "products" | "fabrics" | "offers" | "gallery" | "campaigns" | "brand";

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: UploadFolder;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

type ImageUploaderProps = {
  name: string;
  folder: UploadFolder;
  label?: string;
  existingImageUrl?: string | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (url: string) => void;
};

function validateFile(file: File) {
  if (!allowedTypes.includes(file.type)) return "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP.";
  if (file.size > maxFileSize) return "حجم الصورة كبير جدًا. الحد الأقصى 10MB.";
  return null;
}

function uploadToCloudinary(params: SignResponse, file: File, onProgress: (progress: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", params.apiKey);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("folder", params.folder);

    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let payload: CloudinaryUploadResponse = {};
      try {
        payload = JSON.parse(request.responseText) as CloudinaryUploadResponse;
      } catch {
        reject(new Error("فشل رفع الصورة"));
        return;
      }

      if (request.status >= 200 && request.status < 300 && payload.secure_url) {
        resolve(payload.secure_url);
      } else {
        reject(new Error(payload.error?.message || "فشل رفع الصورة"));
      }
    };
    request.onerror = () => reject(new Error("فشل الاتصال بخدمة رفع الصور"));
    request.send(formData);
  });
}

export function ImageUploader({
  name,
  folder,
  label = "رفع صورة",
  existingImageUrl,
  placeholder = "/images/sofa-wood-main.svg",
  required,
  className,
  onChange
}: ImageUploaderProps) {
  const inputId = useId();
  const [value, setValue] = useState(existingImageUrl ?? "");
  const [preview, setPreview] = useState(existingImageUrl ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  async function startUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSuccess(false);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setError("");
    setSuccess(false);
    setUploading(true);
    setProgress(0);

    try {
      const signResponse = await fetch("/api/admin/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder })
      });
      const signedPayload = (await signResponse.json()) as Partial<SignResponse> & { error?: string };
      if (!signResponse.ok) throw new Error(signedPayload.error || "Cloudinary غير مهيأ لرفع الصور.");
      if (!signedPayload.cloudName || !signedPayload.apiKey || !signedPayload.signature || !signedPayload.timestamp || !signedPayload.folder) {
        throw new Error("بيانات رفع الصورة غير مكتملة.");
      }

      const uploadedUrl = await uploadToCloudinary(signedPayload as SignResponse, file, setProgress);
      setValue(uploadedUrl);
      setPreview(uploadedUrl);
      setSuccess(true);
      onChange?.(uploadedUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "فشل رفع الصورة");
      setSuccess(false);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void startUpload(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void startUpload(file);
  }

  function updateManualValue(nextValue: string) {
    setValue(nextValue);
    setPreview(nextValue);
    setSuccess(false);
    setError("");
    onChange?.(nextValue);
  }

  return (
    <div className={cn("grid gap-3 text-sm", className)}>
      <div className="font-semibold">{label}</div>
      <div
        role="region"
        aria-label="منطقة رفع الصور"
        aria-busy={uploading}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            document.getElementById(inputId)?.click();
          }
        }}
        tabIndex={0}
        className={cn(
          "grid gap-3 rounded-xl border border-dashed border-border bg-white p-3 transition",
          dragActive ? "border-primary bg-muted/50" : "hover:bg-muted/30"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative grid h-24 w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:w-32">
            {preview ? (
              // The admin input accepts local paths, blob previews, Cloudinary URLs, and legacy manual URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="معاينة الصورة" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="font-semibold">اسحب الصورة هنا أو اختر من الجهاز</div>
            <div className="text-xs leading-6 text-muted-foreground">JPG أو PNG أو WebP حتى 10MB. يمكن أيضًا استخدام رابط يدوي.</div>
            <div className="flex flex-wrap gap-2">
              <Button asChild type="button" size="sm" variant="secondary">
                <label htmlFor={inputId} className="cursor-pointer">
                  <UploadCloud className="h-4 w-4" />
                  اختر صورة
                </label>
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => updateManualValue("")}>
                <Trash2 className="h-4 w-4" />
                إزالة الصورة
              </Button>
            </div>
          </div>
        </div>
        <input id={inputId} type="file" accept={allowedTypes.join(",")} className="sr-only" onChange={handleFileChange} />
        {uploading ? (
          <div role="status" aria-live="polite" className="space-y-2 rounded-xl bg-muted/60 p-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري رفع الصورة...
              <span className="ms-auto">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}
        {success ? (
          <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            تم رفع الصورة
          </div>
        ) : null}
        {error ? <div role="alert" aria-live="assertive" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</div> : null}
      </div>
      <label className="grid gap-2">
        <span className="font-semibold">استخدام رابط يدوي</span>
        <input
          name={name}
          value={value}
          onChange={(event) => updateManualValue(event.target.value)}
          required={required}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    </div>
  );
}
