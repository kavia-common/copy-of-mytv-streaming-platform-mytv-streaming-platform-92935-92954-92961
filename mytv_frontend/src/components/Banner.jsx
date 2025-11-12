import React from "react";
import useRandomBanner from "./useRandomBanner";

/**
 * PUBLIC_INTERFACE
 * Banner
 * A reusable 16:9 image banner with overlay and content slot.
 * Props:
 * - image: optional lock to a specific image source.
 * - alt: alt text
 * - height: string CSS height with safe clamp default
 * - children: overlay content
 */
export default function Banner({ image, alt = "Banner", height = "min(56rem, 80svh)", children }) {
  const { src } = useRandomBanner(image);
  const imgSrc = src || image || "/assets/banner-default.jpg";

  return (
    <section
      className="relative w-full overflow-hidden hero header-hero"
      style={{
        height,
        maxHeight: "100svh",
      }}
    >
      <div className="aspect-16-9">
        <img
          key={imgSrc}
          src={imgSrc}
          alt={alt}
          className="media-cover hero-crossfade will-opacity"
          loading="eager"
          draggable="false"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 10%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10">{children}</div>
    </section>
  );
}
