import Image from "next/image";

type ThemedImageFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  variant?: "brand" | "product" | "thumb";
};

export function ThemedImageFrame({
  src,
  alt,
  sizes,
  priority = false,
  fill = false,
  width,
  height,
  className = "",
  frameClassName = "",
  imageClassName = "",
  variant = "product",
}: ThemedImageFrameProps) {
  return (
    <div
      className={`mystique-image-frame mystique-image-frame--${variant} ${className}`}
    >
      <span aria-hidden="true" className="mystique-image-frame__aura" />
      <span aria-hidden="true" className="mystique-image-frame__glow" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--1" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--2" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--3" />
      <span aria-hidden="true" className="mystique-image-frame__particle mystique-image-frame__particle--4" />
      <span className={`mystique-image-frame__surface ${frameClassName}`}>
        <span aria-hidden="true" className="mystique-image-frame__shade" />
        <span aria-hidden="true" className="mystique-image-frame__vignette" />
        <Image
          src={src}
          alt={alt}
          priority={priority}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          className={`mystique-image-frame__image ${imageClassName}`}
        />
      </span>
    </div>
  );
}
