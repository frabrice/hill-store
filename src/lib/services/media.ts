/**
 * Image delivery.
 *
 * Today: products carry no real photos, so callers fall back to the generated
 * pastel placeholder in <ProductImage>. When Cloudinary is wired up, only the
 * cloud name env var needs to appear — every call site already goes through
 * this helper.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
  | string
  | undefined;

export interface ImageOptions {
  width?: number;
  height?: number;
  /** Cloudinary crop mode. */
  crop?: 'fill' | 'fit' | 'scale';
}

/**
 * Build a delivery URL for a Cloudinary public ID.
 * Returns null when no cloud is configured or no ID was given, which is the
 * signal for the UI to draw its placeholder instead.
 */
export function imageUrl(
  publicId: string | undefined,
  opts: ImageOptions = {},
): string | null {
  if (!publicId) return null;

  const { width, height, crop = 'fill' } = opts;

  /*
   * Absolute URL — currently the Unsplash placeholder photography. Unsplash
   * serves resizing through query params, so we ask for exactly the size the
   * layout needs rather than shipping a 4000px original.
   */
  if (publicId.startsWith('http')) {
    const params = new URLSearchParams({
      auto: 'format',
      fit: 'crop',
      q: '75',
    });
    if (width) params.set('w', String(width));
    if (height) params.set('h', String(height));
    return `${publicId}?${params.toString()}`;
  }

  if (!CLOUD_NAME) return null;
  const transforms = [
    'f_auto', // best format the browser supports
    'q_auto', // quality by content
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
    'dpr_auto',
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/** Small blurred version, for use as a loading placeholder. */
export function imageBlurUrl(publicId: string | undefined): string | null {
  if (!publicId) return null;
  if (publicId.startsWith('http')) return `${publicId}?auto=format&w=24&q=40&blur=200`;
  if (!CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_24,e_blur:400,q_auto,f_auto/${publicId}`;
}
