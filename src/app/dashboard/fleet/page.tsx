import Link from "next/link";
import { getTrucks } from "@/lib/db/queries";
import { TruckStatusBadge } from "@/components/fleet/truck-status-badge";
import { formatCurrency } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FleetPage() {
  const trucks = await getTrucks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flota</h1>
          <p className="text-muted-foreground">
            {trucks.length} camiones registrados
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Todos los camiones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Millaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tarifa/semana</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell className="font-medium">
                    {truck.unit_number}
                  </TableCell>
                  <TableCell>
                    {truck.make} {truck.model}
                  </TableCell>
                  <TableCell>{truck.year}</TableCell>
                  <TableCell>
                    {truck.mileage?.toLocaleString()} mi
                  </TableCell>
                  <TableCell>
                    <TruckStatusBadge status={truck.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(truck.weekly_rate)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/fleet/${truck.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Detalle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {trucks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay camiones registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
