"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  DollarSign,
  Wrench,
  BarChart3,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/fleet", label: "Flota", icon: Truck },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/rentals", label: "Contratos", icon: FileText },
  { href: "/dashboard/payments", label: "Pagos", icon: DollarSign },
  { href: "/dashboard/maintenance", label: "Mantenimiento", icon: Wrench },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 px-5">
        <img
          src="https://transfertruckscorp.com/wp-content/uploads/2026/02/LOgo-1.webp"
          alt="Transfer Trucks"
          className="h-7 w-auto"
        />
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
