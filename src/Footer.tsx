"use client";
import { Heart, Home, ScrollText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils/cn";

export default function Footer() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <footer className="bg-green-900 w-full flex justify-between px-12 py-3 fixed bottom-0 right-0 left-0">
      <Link
        href={"/"}
        className={cn(
          "flex flex-col text-white items-center after:w-0 after:h-1 after:rounded-[4px] after:bg-white relative after:absolute after:left-0 after:-bottom-2 after:right-0",
          {
            "w-full": pathname === "/",
          },
        )}
      >
        <Home />
        <span>Home</span>
      </Link>

      <Link href={"/favorites"} className="flex flex-col items-center">
        <Heart />
        <span>Favorite</span>
      </Link>

      <Link href={"/order"} className="flex flex-col items-center">
        <ScrollText />
        <span>YourOrder</span>
      </Link>
    </footer>
  );
}
