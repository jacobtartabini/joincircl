
import React from "react";

interface GradientIconBgProps {
  children: React.ReactNode;
  size?: number;
}

/**
 * GradientIconBg wraps its children in a nice blue/fuchsia/pink gradient rounded square,
 * used for icons with solid white foregrounds.
 */
export default function GradientIconBg({ children, size = 32 }: GradientIconBgProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #3b82f6 0%, #a21caf 50%, #ec4899 100%)"
      }}
    >
      {children}
    </div>
  );
}
