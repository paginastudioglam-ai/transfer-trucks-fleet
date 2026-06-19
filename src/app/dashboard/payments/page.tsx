import { getPayments } from "@/lib/api";
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
  const pending = payments.filter((p) => p.status === "PENDING");
  const overdue = pending.filter((p) => p.dueDate < today);
  const paid = payments.filter((p) => p.status === "PAID");

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
                    p.status === "PENDING" && p.dueDate < today;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/rentals/${p.rentalId}`}
                          className="text-brand hover:underline"
                        >
                          {p.rentalId ? `Contrato ${p.rentalId.slice(0,8)}` : "—"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {"—"}
                      </TableCell>
                      <TableCell>#{p.weekNumber}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        {formatDate(p.dueDate)}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-400">
                            ({daysAgo(p.dueDate)}d)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "PAID"
                              ? "success"
                              : isOverdue
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {p.status === "PAID"
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
                        {p.paidDate ? formatDate(p.paidDate) : "—"}
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
