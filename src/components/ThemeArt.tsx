type Props = {
  /** Base path without extension, e.g. `/people` or `/networkers-unify` */
  base: string;
  /** File extension for landscape light asset (default jpg). */
  ext?: "jpg" | "png";
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Portrait filenames use `${base}-portrait` pattern unless overridden. */
  portraitBase?: string;
};

/**
 * Light/dark (+ portrait) art that follows `data-resolved-theme` on <html>.
 * Expects files: `{base}.{ext}`, `{base}-dark.{ext}`, `{base}-portrait.jpg`, `{base}-portrait-dark.jpg`.
 */
export function ThemeArt({
  base,
  ext = "jpg",
  alt,
  width,
  height,
  className = "section-graphic-img",
  portraitBase,
}: Props) {
  const pBase = portraitBase || `${base}-portrait`;
  const light = `${base}.${ext}`;
  const dark = `${base}-dark.${ext === "png" ? "jpg" : ext}`;
  const lightP = `${pBase}.jpg`;
  const darkP = `${pBase}-dark.jpg`;

  return (
    <div className="theme-art">
      <picture className="theme-art-light">
        <source media="(max-width: 767px)" srcSet={lightP} width={512} height={1024} />
        <img
          src={light}
          alt={alt}
          width={width}
          height={height}
          className={className}
          decoding="async"
        />
      </picture>
      <picture className="theme-art-dark">
        <source media="(max-width: 767px)" srcSet={darkP} width={512} height={1024} />
        <img
          src={dark}
          alt={alt}
          width={width}
          height={height}
          className={className}
          decoding="async"
        />
      </picture>
    </div>
  );
}
