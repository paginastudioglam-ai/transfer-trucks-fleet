import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

const API_URL = "http://212.227.251.228/api";

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  return res.json();
}

export default async function ReportsPage() {
  const [cashflow, revenue, occupancy, topClients, delinquency] =
    await Promise.all([
      api<any>("/reports/cashflow"),
      api<any[]>("/reports/revenue-per-truck"),
      api<any>("/reports/occupancy"),
      api<any[]>("/reports/top-clients"),
      api<any>("/reports/delinquency"),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Métricas financieras y operativas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{occupancy.occupancyRate}%</p>
            <p className="text-xs text-muted-foreground">{occupancy.rentedNow}/{occupancy.totalTrucks} camiones alquilados</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cobrado este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(cashflow.thisMonth.collected)}</p>
            <p className="text-xs text-muted-foreground">de {formatCurrency(cashflow.thisMonth.expected)} esperado</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Morosidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{delinquency.delinquencyRate}%</p>
            <p className="text-xs text-muted-foreground">{delinquency.delinquentCount} pagos atrasados</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-400">{formatCurrency(cashflow.thisMonth.pending)}</p>
            <p className="text-xs text-muted-foreground">por cobrar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-lg">Revenue por Camión</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenue.map((r: any) => (
                <div key={r.unitNumber} className="flex justify-between items-center border-b border-border pb-2">
                  <div>
                    <span className="font-medium">{r.unitNumber}</span>
                    <span className="text-xs text-muted-foreground ml-2">{r.status}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(r.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-lg">Top Clientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topClients.slice(0, 5).map((c: any) => (
                <div key={c.name} className="flex justify-between items-center border-b border-border pb-2">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    {c.company && <span className="text-xs text-muted-foreground ml-2">{c.company}</span>}
                    {c.latePayments > 0 && <span className="text-xs text-red-400 ml-2">⚠️ {c.latePayments} atrasos</span>}
                  </div>
                  <span className="font-medium">{formatCurrency(c.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
