import Link from "next/link";
import { getRentals } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  overdue: "Atrasado",
  completed: "Finalizado",
  terminated: "Terminado",
};

const statusVariants: Record<string, "success" | "default" | "warning" | "destructive"> = {
  pending: "warning",
  active: "success",
  overdue: "destructive",
  completed: "default",
  terminated: "destructive",
};

export default async function RentalsPage() {
  const rentals = await getRentals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            {rentals.length} contratos registrados
          </p>
        </div>
        <Link href="/dashboard/rentals/new" className={cn(buttonVariants({}))}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Contrato
          </Link>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Todos los contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Camión</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin previsto</TableHead>
                <TableHead>Tarifa/sem</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.contract_number}
                  </TableCell>
                  <TableCell>{r.client?.full_name}</TableCell>
                  <TableCell>{r.truck?.unit_number}</TableCell>
                  <TableCell>{formatDate(r.start_date)}</TableCell>
                  <TableCell>
                    {r.expected_end_date
                      ? formatDate(r.expected_end_date)
                      : "Abierto"}
                  </TableCell>
                  <TableCell>{formatCurrency(r.weekly_rate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[r.status] ?? "outline"}>
                      {statusLabels[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/rentals/${r.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Ver</Link>
                  </TableCell>
                </TableRow>
              ))}
              {rentals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No hay contratos registrados
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
