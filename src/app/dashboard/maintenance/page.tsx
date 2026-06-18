"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createMaintenance } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Loader2, AlertTriangle } from "lucide-react";

const typeLabels: Record<string, string> = {
  oil_change: "Cambio aceite",
  tires: "Llantas",
  brakes: "Frenos",
  engine: "Motor",
  body: "Carrocería",
  inspection: "Inspección",
  other: "Otro",
};

interface Truck {
  id: string;
  unit_number: string;
  mileage: number;
}

interface MaintRecord {
  id: string;
  type: string;
  date: string;
  cost: number;
  vendor: string;
  next_due_date: string;
  mileage: number;
  notes: string;
  truck: { unit_number: string }[];
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintRecord[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [truckId, setTruckId] = useState("");
  const [type, setType] = useState("oil_change");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mileage, setMileage] = useState("");
  const [vendor, setVendor] = useState("");
  const [cost, setCost] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    const supabase = createClient();
    const [{ data: r }, { data: t }] = await Promise.all([
      supabase
        .from("maintenance_records")
        .select("*, truck:trucks!inner(unit_number)")
        .order("date", { ascending: false }),
      supabase
        .from("trucks")
        .select("id, unit_number, mileage")
        .order("unit_number"),
    ]);
    setRecords((r as MaintRecord[]) ?? []);
    setTrucks((t as Truck[]) ?? []);
    setFetching(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (truckId) {
      const truck = trucks.find((t) => t.id === truckId);
      if (truck) setMileage(truck.mileage.toString());
    }
  }, [truckId, trucks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createMaintenance({
      truckId,
      type,
      date,
      mileage: parseInt(mileage) || undefined,
      vendor: vendor || undefined,
      cost: parseFloat(cost) || undefined,
      nextDueDate: nextDueDate || undefined,
      notes: notes || undefined,
    });
    if (result.success) {
      setOpen(false);
      resetForm();
      fetchData();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTruckId("");
    setType("oil_change");
    setDate(new Date().toISOString().split("T")[0]);
    setMileage("");
    setVendor("");
    setCost("");
    setNextDueDate("");
    setNotes("");
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = records.filter((r) => r.next_due_date && r.next_due_date >= today && r.next_due_date <= new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground">
            {records.length} registros
            {upcoming.length > 0 &&
              ` · ${upcoming.length} próximo${upcoming.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants({}))}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Registro
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar mantenimiento</DialogTitle>
              <DialogDescription>
                Añade un registro de servicio para un camión
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Camión</Label>
                  <Select value={truckId} onValueChange={(v) => setTruckId(v ?? "")} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.unit_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v ?? "oil_change")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Millaje</Label>
                  <Input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Taller (opcional)</Label>
                  <Input
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Nombre del taller"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Coste $ (opcional)</Label>
                  <Input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    step="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Próx. servicio (opcional)</Label>
                  <Input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Próximos servicios (14 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcoming.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded border border-border p-2 text-sm"
                >
                  <span>
                    <strong>
                      {((r.truck as never[])?.[0] as { unit_number?: string })?.unit_number ?? "—"}
                    </strong>{" "}
                    — {typeLabels[r.type] ?? r.type}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(r.next_due_date)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Historial de mantenimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Cargando...
            </p>
          ) : records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin registros de mantenimiento
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Camión</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Millaje</TableHead>
                  <TableHead>Taller</TableHead>
                  <TableHead>Coste</TableHead>
                  <TableHead>Próx. servicio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell className="font-medium">
                      {((r.truck as never[])?.[0] as { unit_number?: string })?.unit_number ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[r.type] ?? r.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.mileage ? `${r.mileage.toLocaleString()} mi` : "—"}
                    </TableCell>
                    <TableCell>{r.vendor || "—"}</TableCell>
                    <TableCell>
                      {r.cost ? formatCurrency(r.cost) : "—"}
                    </TableCell>
                    <TableCell>
                      {r.next_due_date
                        ? formatDate(r.next_due_date)
                        : "—"}
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
