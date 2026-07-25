"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";
import PageTransition from "./PageTransition";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers(props: ProvidersProps) {
  const { children } = props;
  const pathname = usePathname();
  if (
   pathname.includes("/auth")
  ) {
    return (
      <PageTransition>
        {children}
      </PageTransition>
    );
  }
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <PageTransition>
            {children}
          </PageTransition>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
