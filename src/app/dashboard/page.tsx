import { Truck, AlertTriangle, Clock, Wrench } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboard, getOverduePayments, getTrucks, getMaintenance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDate, daysAgo, daysUntil } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [dash, overduePayments, trucks, maintenance] = await Promise.all([
    getDashboard(),
    getOverduePayments(),
    getTrucks(),
    getMaintenance(),
  ]);

  const stats = dash.stats;
  const today = new Date().toISOString().split("T")[0];
  const upcomingMaintenance = maintenance.filter(
    (m) => m.nextDueDate && m.nextDueDate > today && m.nextDueDate <= new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );

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
          value={stats.overduePayments}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Contratos pendientes</CardTitle>
            <Badge variant="secondary">{dash.pendingRentals}</Badge>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/rentals" className={cn(buttonVariants({ variant: "outline" }))}>
              Ver todos los contratos
            </Link>
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
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.driverName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.contractNumber} · {formatCurrency(p.amount)} · Semana {p.weekNumber} ·{" "}
                        <span className="text-red-400">{daysAgo(p.dueDate)} días atraso</span>
                      </p>
                    </div>
                    <Link href={`/dashboard/rentals/${p.rentalId}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Ver</Link>
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
            <Badge variant="outline">{dash.upcomingRenewals}</Badge>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/rentals" className={cn(buttonVariants({ variant: "outline" }))}>
              Ver contratos próximos a vencer
            </Link>
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
              <p className="py-6 text-center text-sm text-muted-foreground">Sin mantenimientos programados</p>
            ) : (
              <div className="space-y-3">
                {upcomingMaintenance.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.truckId} — {m.serviceType?.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">Vence {formatDate(m.nextDueDate)}</p>
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
