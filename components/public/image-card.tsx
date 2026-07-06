import Image from "next/image";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export function ImageCard({ src, alt, label }: { src: string; alt: string; label?: string }) {
  return (
    <figure className="overflow-hidden rounded-[2rem] bg-card shadow-card ring-1 ring-border">
      <div className="relative aspect-[5/4]">
        <Image src={cloudinaryOptimizedUrl(src)} alt={alt} fill className="h-full w-full object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
      </div>
      {label ? <figcaption className="p-4 text-sm font-semibold text-muted-foreground">{label}</figcaption> : null}
    </figure>
  );
}
