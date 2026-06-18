import Link from "next/link";
import { getClients } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
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

const typeLabels: Record<string, string> = {
  owner_operator: "Owner Operator",
  fleet: "Flota/Empresa",
  contractor: "Contratista",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            {clients.length} clientes registrados
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Todos los clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Alquileres</TableHead>
                <TableHead>% Pago a tiempo</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.full_name}
                  </TableCell>
                  <TableCell>{client.company_name || "—"}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[client.client_type] ?? client.client_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.total_rentals}</TableCell>
                  <TableCell>
                    {client.on_time_payment_rate != null ? (
                      <Badge
                        variant={
                          client.on_time_payment_rate >= 90
                            ? "success"
                            : client.on_time_payment_rate >= 70
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {client.on_time_payment_rate}%
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/clients/${client.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Detalle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay clientes registrados
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
