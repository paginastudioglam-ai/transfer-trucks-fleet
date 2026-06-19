import { notFound } from "next/navigation";
import { getRental } from "@/lib/api";
import { completeRental } from "@/lib/actions";
import { formatCurrency, formatDate, daysAgo } from "@/lib/format";
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
import { LogPaymentButton } from "@/components/payments/log-payment-button";
import { CompleteRentalButton } from "@/components/rentals/complete-rental-button";
import Link from "next/link";

interface RentalDetailPageProps {
  params: Promise<{ id: string }>;
}

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

const paymentDayLabels: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
};

export default async function RentalDetailPage({ params }: RentalDetailPageProps) {
  const { id } = await params;
  const [rental, payments] = await Promise.all([
    getRentalById(id),
    getRentalPayments(id),
  ]);

  if (!rental) notFound();

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending" && new Date(p.due_date) < new Date())
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{rental.contract_number}</h1>
            <Badge variant={statusVariants[rental.status] ?? "outline"}>
              {statusLabels[rental.status] ?? rental.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {rental.client?.full_name} · {rental.truck?.unit_number} · Creado{" "}
            {formatDate(rental.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {rental.status === "active" && (
            <CompleteRentalButton rentalId={rental.id} />
          )}
          <Link href="/dashboard/rentals" className={cn(buttonVariants({ variant: "outline" }))}>← Volver</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Detalles del contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Cliente</p>
              <p className="font-medium">{rental.client?.full_name}</p>
              <p className="text-xs text-muted-foreground">{rental.client?.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Camión</p>
              <p className="font-medium">{rental.truck?.unit_number}</p>
              <p className="text-xs text-muted-foreground">
                {rental.truck?.make} {rental.truck?.model}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Inicio</p>
              <p>{formatDate(rental.start_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fin previsto</p>
              <p>
                {rental.expected_end_date
                  ? formatDate(rental.expected_end_date)
                  : "Abierto"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tarifa semanal</p>
              <p className="font-medium">{formatCurrency(rental.weekly_rate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Depósito</p>
              <p>{formatCurrency(rental.deposit_paid)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Día de pago</p>
              <p>{paymentDayLabels[rental.payment_day] ?? rental.payment_day}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Documentos firmados</p>
              <Badge variant={rental.documents_signed ? "success" : "warning"}>
                {rental.documents_signed ? "Sí" : "No"}
              </Badge>
            </div>
            {rental.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Notas</p>
                <p>{rental.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total pagado</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pendiente vencido</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(totalPending)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Semanas totales</p>
              <p className="font-medium">{payments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Semanas pagadas</p>
              <p className="font-medium">
                {payments.filter((p) => p.status === "paid").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Calendario de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin pagos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha pago</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const isOverdue =
                    p.status === "pending" &&
                    new Date(p.due_date) < new Date();
                  return (
                    <TableRow key={p.id}>
                      <TableCell>#{p.week_number}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        {formatDate(p.due_date)}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-400">
                            ({daysAgo(p.due_date)}d atraso)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "paid"
                              ? "success"
                              : isOverdue
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {p.status === "pending" && isOverdue
                            ? "Atrasado"
                            : p.status === "paid"
                              ? "Pagado"
                              : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.method ?? "—"}</TableCell>
                      <TableCell>
                        {p.paid_date ? formatDate(p.paid_date) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status !== "paid" && (
                          <LogPaymentButton payment={p} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
