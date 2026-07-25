"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

export function NavUser({
  user: initialUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [userInfo, setUserInfo] = useState(initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json?.user?.username) {
            const raw = json.user.username;
            const capitalizedName =
              raw.charAt(0).toUpperCase() + raw.slice(1);
            setUserInfo({
              name: `${capitalizedName} (Admin)`,
              email: `${raw}@serabcoffee.com`,
              avatar: "",
            });
          }
        }
      } catch {
        // Fallback default tetap berjalan jika fetch gagal
      }
    }
    fetchMe();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Gagal logout, coba lagi.");
      }

      // Hard redirect agar cookie dan cache ter-reset bersih
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  }

  // Ambil inisial nama untuk avatar badge (contoh: "AS" / "SC")
  const initials =
    userInfo.name
      .replace(/\(.*\)/, "")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-[12px] p-2 transition-all duration-200"
            >
              <Avatar className="h-9 w-9 rounded-[10px] bg-primary/20 border border-primary/30 flex items-center justify-center shadow-xs">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="rounded-[10px] bg-primary text-primary-foreground font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground flex items-center gap-1">
                  {userInfo.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {userInfo.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-[14px] p-2 shadow-xl border-border/80 bg-card/98 backdrop-blur-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-1 font-normal">
              <div className="flex items-center gap-3 px-2.5 py-2.5 text-left text-sm bg-muted/40 rounded-[10px] border border-border/40">
                <Avatar className="h-10 w-10 rounded-[10px] shadow-xs">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="rounded-[10px] bg-primary text-primary-foreground font-extrabold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground flex items-center gap-1.5">
                    {userInfo.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userInfo.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1.5" />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-600 rounded-[8px] cursor-pointer font-semibold py-2 px-2.5 transition-colors"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOutIcon className="w-4 h-4 mr-2" />
              )}
              {isLoggingOut ? "Mengeluarkan Sesi..." : "Keluar Sesi (Log out)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
