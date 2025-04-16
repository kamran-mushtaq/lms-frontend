"use client";

import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import Preloader from "@/components/prealoader";
import { ContentLayout } from "@/components/admin-panel/content-other-layout";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust this value to control the minimum loading time

    return () => clearTimeout(timer);
  }, []);

  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;

  return (
    <>
      {/* <Sidebar /> */}
      <div className="container mx-auto">
      <ContentLayout title="Attribute Types Management"><span></span></ContentLayout>
      <div className="p-2 bg-background">
        {isLoading && <Preloader />}
        <main
          className={cn(
            `min-h-[calc(100vh_-_52px)]  shadow-md shadow-black/5 dark:border-muted-background dark:bg-dashboard-background bg-muted border-r dark:border transition-[margin-left] ease-in-out duration-300 rounded-2xl ${
              isLoading ? "blur-sm" : ""
            }`,
            !settings.disabled &&
              (!getOpenState() ? "" : "")
          )}
        >
           {/* <ContentLayout title="Attribute Types Management"> */}
          {children}
           {/* </ContentLayout> */}
        </main>
      </div>
      </div>

      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-56")
        )}
      >
        <Footer />
      </footer>
    </>
  );
}
