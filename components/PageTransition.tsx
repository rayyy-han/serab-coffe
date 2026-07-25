"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);
  const [stage, setStage] = useState<"enter" | "idle">("enter");

  useEffect(() => {
    // Every time pathname changes (including first load), trigger enter animation
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setStage("enter");
      const t = setTimeout(() => setStage("idle"), 650);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={stage === "enter" ? "page-enter" : "page-idle"}
      style={{ width: "100%", minHeight: "100%" }}
    >
      {children}
    </div>
  );
}
