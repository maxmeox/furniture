/**
 * Shared Cloudinary URL optimizer — safe for client & server.
 *
 * Applies Cloudinary's automatic quality, format, and size optimizations.
 * Passes through non-Cloudinary URLs unchanged.
 *
 * @param url    The raw Cloudinary URL (or any URL — non-Cloudinary passes through).
 * @param width  Optional target display width in CSS pixels.
 *               Cloudinary delivers 2× for retina (e.g. w_640 for a 320px slot).
 *               When omitted, caps at w_1600 (optimal for most viewports — a 1600px source
 *               covers 800px display slots at 2x DPR without wasting bandwidth).
 *
 * @see https://cloudinary.com/documentation/image_optimization
 */
export function cloudinaryOptimizedUrl(url: string, width?: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  // f_auto        — automatic format selection (WebP/AVIF based on browser)
  // q_auto:good   — smart quality compression (balances size & fidelity)
  // fl_progressive:semi — semi-progressive loading (perceived performance)
  // c_limit       — scale down, never up (preserves quality on small screens)
  // dpr_auto      — auto device-pixel-ratio (1x or 2x depending on screen)
  const w = width != null ? `w_${Math.round(width * 2)},` : "w_1600,";

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto:good,fl_progressive:semi,${w}c_limit,dpr_auto/`
  );
}

/**
 * Generate a responsive srcSet string with Cloudinary transformations at
 * multiple breakpoint widths. Use with `<Image srcSet={...} sizes={...} />`
 * when `unoptimized` is set (Next.js won't auto-generate srcset for unoptimized images).
 *
 * Renders width descriptors so the browser can select the best resource
 * for the current viewport × DPR combination.
 */
export function cloudinarySrcSet(url: string): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  // Width descriptors at common display sizes.
  // Cloudinary delivers the physical width: the browser multiplies by DPR
  // when picking from srcset (e.g. 480w on a 2x screen fills a 240 CSS-px slot).
  const widths = [480, 640, 768, 960, 1200, 1600];
  return widths
    .map((w) => {
      const sized = url.replace(
        "/upload/",
        `/upload/w_${w},f_auto,q_auto:good,fl_progressive:semi,c_limit,dpr_auto/`
      );
      return `${sized} ${w}w`;
    })
    .join(", ");
}
