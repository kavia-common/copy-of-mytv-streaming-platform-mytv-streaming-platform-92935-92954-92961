import React from "react";

/**
 * PUBLIC_INTERFACE
 * Banner
 * A reusable 16:9 image banner with overlay and content children slot.
 */
export default function Banner({ image, alt = "Banner", height = "min(56rem, 80svh)", children }) {
  return (
    <section
      className="relative w-full overflow-hidden hero header-hero"
      style={{
        height,
        maxHeight: "100svh",
      }}
    >
      <div className="aspect-16-9">
        <img src={image} alt={alt} className="media-cover" loading="eager" draggable="false" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="absolute inset-0 z-10">{children}</div>
    </section>
  );
}
