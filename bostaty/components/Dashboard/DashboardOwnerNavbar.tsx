"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/providers/TenantProvider";
import { DASHBOARD_MENU } from "@/config/menu";
import { cn } from "@/lib/utils"; 

export function Sidebar() {
  const { enabledModules } = useTenant();
  const pathname = usePathname();
console.log("Enabled Modules in Sidebar:", enabledModules);
  return (
    <aside className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-6 font-bold text-xl border-b">
        App Name
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {DASHBOARD_MENU.map((item) => {
          // Logic: Show if it's CORE or if the tenant has paid for this module
          const isVisible = item.module === 'CORE' || enabledModules.includes(item.module);

          if (!isVisible) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white" // Uses your dynamic --primary-color!
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}