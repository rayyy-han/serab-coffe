import React from "react";
import Image from "next/image";

interface LogoProps {
  /**
   * Controls the HEIGHT of the logo. Width auto-scales based on
   * the PNG's natural ~1.35:1 ratio (1050w x 780h approx).
   */
  height?: number;
  variant?: "icon" | "full" | "horizontal";
  className?: string;
  /**
   * When true, wraps the PNG in a cream/white pill so it stays
   * legible on dark sidebar backgrounds (no broken CSS filters).
   */
  onDark?: boolean;
}

// Official PNG natural aspect ratio ≈ 1050 / 780 ≈ 1.346
const LOGO_RATIO = 1050 / 780;

/**
 * Serab Coffee Official Logo
 * Always renders the real PNG at correct proportions.
 */
export function SerabLogoIcon({
  height = 40,
  className = "",
  onDark = false,
}: LogoProps) {
  const imgWidth = Math.round(height * LOGO_RATIO);

  const img = (
    <Image
      src="/serab aja.png"
      alt="Serab Coffee Brewery"
      width={imgWidth}
      height={height}
      style={{
        width: imgWidth,
        height: height,
        objectFit: "contain",
        display: "block",
      }}
      priority
    />
  );

  if (onDark) {
    // Wrap in a small cream pill so the white-background PNG stays visible
    return (
      <div
        className={`shrink-0 rounded-lg overflow-hidden ${className}`}
        style={{
          background: "#F4EDE0",
          padding: "3px 6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {img}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {img}
    </div>
  );
}

/**
 * Full logo with text (only emblem section of PNG shown,
 * since text is already embedded in the PNG itself).
 */
export function SerabLogo({
  height = 56,
  variant = "full",
  className = "",
  onDark = false,
}: LogoProps) {
  if (variant === "icon") {
    return <SerabLogoIcon height={height} className={className} onDark={onDark} />;
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Full logo PNG already includes SERAB COFFEE BREWERY + feel the deLIGHT text */}
      <SerabLogoIcon height={height} onDark={onDark} />
    </div>
  );
}

export default SerabLogo;
