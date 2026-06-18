import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variants = {
  default: "text-brand bg-brand/10",
  success: "text-green-400 bg-green-400/10",
  warning: "text-amber-400 bg-amber-400/10",
  danger: "text-red-400 bg-red-400/10",
};

export function StatCard({ label, value, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", variants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
