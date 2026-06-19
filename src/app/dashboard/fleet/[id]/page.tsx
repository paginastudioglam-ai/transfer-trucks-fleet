import { notFound } from "next/navigation";
import { getTruck } from "@/lib/api";
import { TruckStatusBadge } from "@/components/fleet/truck-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TruckDetailPageProps {
  params: Promise<{ id: string }>;
}

const maintenanceLabels: Record<string, string> = {
  oil_change: "Cambio aceite",
  tires: "Llantas",
  brakes: "Frenos",
  engine: "Motor",
  body: "Carrocería",
  inspection: "Inspección",
  other: "Otro",
};

export default async function TruckDetailPage({ params }: TruckDetailPageProps) {
  const { id } = await params;
  const truck = await getTruck(id);

  if (!truck) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{truck.unit_number}</h1>
            <TruckStatusBadge status={truck.status} />
          </div>
          <p className="text-muted-foreground">
            {truck.make} {truck.model} · {truck.year} · {truck.box_length} ·{" "}
            {truck.mileage?.toLocaleString()} mi
          </p>
        </div>
        <Link href="/dashboard/fleet" className={cn(buttonVariants({ variant: "outline" }))}>← Volver</Link>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="rentals">Historial Contratos</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Detalles del camión</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">VIN</p>
                <p>{truck.vin || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tarifa semanal</p>
                <p className="font-medium">{formatCurrency(truck.weekly_rate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Depósito</p>
                <p>{formatCurrency(truck.deposit_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p>{truck.location || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Seguro vence</p>
                <p>{truck.insurance_expiry ? formatDate(truck.insurance_expiry) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Registro vence</p>
                <p>{truck.registration_expiry ? formatDate(truck.registration_expiry) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Último servicio</p>
                <p>{truck.last_service_date ? formatDate(truck.last_service_date) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próximo servicio</p>
                <p>{truck.next_service_due ? formatDate(truck.next_service_due) : "—"}</p>
              </div>
              {truck.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Notas</p>
                  <p>{truck.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rentals" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Historial de contratos</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Sin contratos registrados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
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
                        <TableCell>{r.client?.full_name}</TableCell>
                        <TableCell>{formatDate(r.start_date)}</TableCell>
                        <TableCell>
                          {r.expected_end_date ? formatDate(r.expected_end_date) : "Abierto"}
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
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Registros de mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Sin mantenimientos registrados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Millaje</TableHead>
                      <TableHead>Taller</TableHead>
                      <TableHead>Coste</TableHead>
                      <TableHead>Próx. servicio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{formatDate(m.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {maintenanceLabels[m.type] ?? m.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {m.mileage ? `${m.mileage.toLocaleString()} mi` : "—"}
                        </TableCell>
                        <TableCell>{m.vendor || "—"}</TableCell>
                        <TableCell>
                          {m.cost ? formatCurrency(m.cost) : "—"}
                        </TableCell>
                        <TableCell>
                          {m.next_due_date ? formatDate(m.next_due_date) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
