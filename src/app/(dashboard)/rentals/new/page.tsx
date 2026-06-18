"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRental } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
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
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Truck {
  id: string;
  unit_number: string;
  weekly_rate: number;
  status: string;
}

interface Client {
  id: string;
  full_name: string;
  phone: string;
}

export default function NewRentalPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [truckId, setTruckId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const [depositPaid, setDepositPaid] = useState("0");
  const [paymentDay, setPaymentDay] = useState("monday");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("trucks")
      .select("id, unit_number, weekly_rate, status")
      .eq("status", "available")
      .order("unit_number")
      .then(({ data }) => setTrucks(data ?? []));

    supabase
      .from("clients")
      .select("id, full_name, phone")
      .eq("status", "active")
      .order("full_name")
      .then(({ data }) => setClients(data ?? []));
  }, []);

  useEffect(() => {
    if (truckId) {
      const truck = trucks.find((t) => t.id === truckId);
      if (truck) setWeeklyRate(truck.weekly_rate.toString());
    }
  }, [truckId, trucks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createRental({
      clientId,
      truckId,
      startDate,
      expectedEndDate: expectedEndDate || undefined,
      weeklyRate: parseFloat(weeklyRate),
      depositPaid: parseFloat(depositPaid) || 0,
      paymentDay,
      notes: notes || undefined,
    });

    if (result.success) {
      router.push(`/dashboard/rentals/${result.rentalId}`);
      router.refresh();
    } else {
      setError(result.error ?? "Error al crear contrato");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rentals" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Contrato</h1>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name} · {c.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck">Camión</Label>
                <Select value={truckId} onValueChange={(v) => setTruckId(v ?? "")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar camión disponible..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trucks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.unit_number} · {t.weekly_rate}/sem
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedEndDate">Fecha fin (opcional)</Label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  value={expectedEndDate}
                  onChange={(e) => setExpectedEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyRate">Tarifa semanal ($)</Label>
                <Input
                  id="weeklyRate"
                  type="number"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  required
                  min="0"
                  step="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositPaid">Depósito ($)</Label>
                <Input
                  id="depositPaid"
                  type="number"
                  value={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.value)}
                  min="0"
                  step="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDay">Día de pago</Label>
                <Select value={paymentDay} onValueChange={(v) => setPaymentDay(v ?? "monday")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Lunes</SelectItem>
                    <SelectItem value="tuesday">Martes</SelectItem>
                    <SelectItem value="wednesday">Miércoles</SelectItem>
                    <SelectItem value="thursday">Jueves</SelectItem>
                    <SelectItem value="friday">Viernes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Condiciones especiales, observaciones..."
                  rows={2}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando contrato...
                </>
              ) : (
                "Crear Contrato"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
