import { Badge } from "@/components/ui/badge";

interface TruckStatusBadgeProps {
  status: string;
}

const labels: Record<string, string> = {
  available: "Disponible",
  rented: "Alquilado",
  maintenance: "En taller",
  retired: "Retirado",
};

const variants: Record<string, "success" | "default" | "warning" | "destructive"> = {
  available: "success",
  rented: "default",
  maintenance: "warning",
  retired: "destructive",
};

export function TruckStatusBadge({ status }: TruckStatusBadgeProps) {
  return (
    <Badge variant={variants[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  );
}
