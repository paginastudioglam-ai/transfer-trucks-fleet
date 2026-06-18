import { notFound } from "next/navigation";
import { getClientById, getClientRentals } from "@/lib/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

const typeLabels: Record<string, string> = {
  owner_operator: "Owner Operator",
  fleet: "Flota/Empresa",
  contractor: "Contratista",
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const [client, rentals] = await Promise.all([
    getClientById(id),
    getClientRentals(id),
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.full_name}</h1>
          <p className="text-muted-foreground">
            {typeLabels[client.client_type] ?? client.client_type}
            {client.company_name && ` · ${client.company_name}`}
          </p>
        </div>
        <Link href="/dashboard/clients" className={cn(buttonVariants({ variant: "outline" }))}>← Volver</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p>{client.phone}</p>
            </div>
            {client.email && (
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{client.email}</p>
              </div>
            )}
            {client.license_number && (
              <div>
                <p className="text-muted-foreground">Licencia</p>
                <p>{client.license_number}</p>
              </div>
            )}
            {client.insurance_provider && (
              <div>
                <p className="text-muted-foreground">Aseguradora</p>
                <p>{client.insurance_provider}</p>
              </div>
            )}
            {client.dot_number && (
              <div>
                <p className="text-muted-foreground">DOT Number</p>
                <p>{client.dot_number}</p>
              </div>
            )}
            {client.notes && (
              <div>
                <p className="text-muted-foreground">Notas</p>
                <p>{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Métricas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Total alquileres</p>
              <p className="text-2xl font-bold">{client.total_rentals}</p>
            </div>
            <div>
              <p className="text-muted-foreground">% Pagos a tiempo</p>
              <p className="text-2xl font-bold">
                {client.on_time_payment_rate != null
                  ? `${client.on_time_payment_rate}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Origen</p>
              <Badge variant="outline">{client.referral_source}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Historial de alquileres</CardTitle>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin alquileres registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Camión</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Tarifa</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/rentals/${r.id}`}
                        className="text-brand hover:underline"
                      >
                        {r.contract_number}
                      </Link>
                    </TableCell>
                    <TableCell>{r.truck?.unit_number}</TableCell>
                    <TableCell>{formatDate(r.start_date)}</TableCell>
                    <TableCell>
                      {r.expected_end_date
                        ? formatDate(r.expected_end_date)
                        : "Abierto"}
                    </TableCell>
                    <TableCell>{formatCurrency(r.weekly_rate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
