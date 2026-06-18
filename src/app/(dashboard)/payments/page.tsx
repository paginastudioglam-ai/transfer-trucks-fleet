import { getPayments } from "@/lib/db/queries";
import { formatCurrency, formatDate, daysAgo } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function PaymentsPage() {
  const payments = await getPayments();

  const today = new Date().toISOString().split("T")[0];
  const pending = payments.filter((p) => p.status === "pending");
  const overdue = pending.filter((p) => p.due_date < today);
  const paid = payments.filter((p) => p.status === "paid");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">
          {pending.length} pendientes · {overdue.length} atrasados · {paid.length}{" "}
          pagados
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Todos los pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay pagos registrados. Crea un contrato para generar el
              calendario de pagos.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Semana</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const isOverdue =
                    p.status === "pending" && p.due_date < today;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/rentals/${p.rental?.id}`}
                          className="text-brand hover:underline"
                        >
                          {p.rental?.contract_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {p.rental?.client?.full_name}
                      </TableCell>
                      <TableCell>#{p.week_number}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        {formatDate(p.due_date)}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-400">
                            ({daysAgo(p.due_date)}d)
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
                          {p.status === "paid"
                            ? "Pagado"
                            : isOverdue
                              ? "Atrasado"
                              : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {p.method ?? "—"}
                      </TableCell>
                      <TableCell>
                        {p.paid_date ? formatDate(p.paid_date) : "—"}
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
