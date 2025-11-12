import { useEffect, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * useRandomBanner
 * React hook to select a random banner image from a curated list on initial mount.
 * Allows optionally locking to a specific src by passing lockSrc. Returns src and
 * a key to help crossfade transitions, as well as the curated list for external usage.
 */
export default function useRandomBanner(lockSrc) {
  // Curated local banner image set; if not present at runtime, these will fall back
  // to copies of the default asset we provide in /public/assets/.
  const curated = useMemo(
    () => [
      "/assets/banner-1.jpg",
      "/assets/banner-2.jpg",
      "/assets/banner-3.jpg",
      "/assets/banner-4.jpg",
      "/assets/banner-5.jpg",
    ],
    []
  );

  const pickRandom = () => curated[Math.floor(Math.random() * curated.length)] || "/assets/banner-default.jpg";
  const initial = lockSrc || pickRandom();

  const [src, setSrc] = useState(initial);
  const [key, setKey] = useState(() => Date.now());
  const hasMounted = useRef(false);

  useEffect(() => {
    // On mount and on page load, (re)pick unless locked
    if (hasMounted.current) return;
    hasMounted.current = true;
    if (!lockSrc) {
      const next = pickRandom();
      setSrc(next);
      setKey(Date.now());
    }
    // Note: We only want this on first mount; eslint-disable-next-line is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { src, key, curated };
}
