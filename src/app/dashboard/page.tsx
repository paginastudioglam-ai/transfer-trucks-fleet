import { Truck, AlertTriangle, Clock, Wrench } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  getTruckStats,
  getOverduePayments,
  getOverdueCount,
  getPendingRentals,
  getUpcomingRenewals,
  getUpcomingMaintenance,
} from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDate, daysAgo, daysUntil } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, overduePayments, overdueCount, pendingRentals, upcomingRenewals, upcomingMaintenance] =
    await Promise.all([
      getTruckStats(),
      getOverduePayments(),
      getOverdueCount(),
      getPendingRentals(),
      getUpcomingRenewals(),
      getUpcomingMaintenance(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Buenos días, Carlos</h1>
        <p className="text-muted-foreground">Aquí está tu flota hoy</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Disponibles"
          value={stats.available}
          icon={Truck}
          variant="success"
        />
        <StatCard
          label="Alquilados"
          value={stats.rented}
          icon={Truck}
          variant="default"
        />
        <StatCard
          label="En taller"
          value={stats.maintenance}
          icon={Wrench}
          variant="warning"
        />
        <StatCard
          label="Pagos atrasados"
          value={overdueCount}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Contratos pendientes</CardTitle>
            <Badge variant="secondary">{pendingRentals.length}</Badge>
          </CardHeader>
          <CardContent>
            {pendingRentals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No hay contratos pendientes de aprobación
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRentals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.client?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.truck?.unit_number} · {formatCurrency(r.weekly_rate)}/semana
                      </p>
                    </div>
                    <div className="ml-3 flex gap-2">
                      <Link href={`/dashboard/rentals/${r.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Revisar</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pagos atrasados</CardTitle>
            <Badge variant="destructive">{overduePayments.length}</Badge>
          </CardHeader>
          <CardContent>
            {overduePayments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                ¡Todo al día! No hay pagos atrasados
              </p>
            ) : (
              <div className="space-y-3">
                {overduePayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {p.rental?.client?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.amount)} · Semana {p.week_number} ·{" "}
                        <span className="text-red-400">
                          {daysAgo(p.due_date)} días atraso
                        </span>
                      </p>
                    </div>
                    <Link href={`/dashboard/rentals/${p.rental?.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Ver contrato</Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximas renovaciones</CardTitle>
            <Badge variant="outline">{upcomingRenewals.length}</Badge>
          </CardHeader>
          <CardContent>
            {upcomingRenewals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin renovaciones en los próximos 30 días
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingRenewals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.client?.full_name} · {r.truck?.unit_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vence {formatDate(r.expected_end_date!)} ·{" "}
                        <Clock className="inline h-3 w-3" />{" "}
                        {daysUntil(r.expected_end_date!)} días
                      </p>
                    </div>
                    <Link href={`/dashboard/rentals/${r.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Ver</Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mantenimiento próximo</CardTitle>
            <Badge variant="outline">{upcomingMaintenance.length}</Badge>
          </CardHeader>
          <CardContent>
            {upcomingMaintenance.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin mantenimientos programados
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.truck?.unit_number} — {m.type?.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vence {formatDate(m.next_due_date!)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/rentals/new" className={cn(buttonVariants({ variant: "default" }))}>+ Nuevo Contrato</Link>
        <Link href="/dashboard/fleet" className={cn(buttonVariants({ variant: "outline" }))}>Gestionar Flota</Link>
        <Link href="/dashboard/clients" className={cn(buttonVariants({ variant: "outline" }))}>Ver Clientes</Link>
        <Link href="/dashboard/payments" className={cn(buttonVariants({ variant: "outline" }))}>Pagos</Link>
      </div>
    </div>
  );
}
