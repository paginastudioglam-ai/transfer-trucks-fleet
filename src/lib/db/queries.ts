import { createServiceSupabase } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export async function getTruckStats() {
  const supabase = createServiceSupabase();
  const { data: trucks } = await supabase.from("trucks").select("status");
  const list = (trucks as Row[]) ?? [];

  const available = list.filter((t: Row) => t.status === "available").length;
  const rented = list.filter((t: Row) => t.status === "rented").length;
  const maintenance = list.filter((t: Row) => t.status === "maintenance").length;
  const total = list.length;

  return { available, rented, maintenance, total };
}

export async function getOverduePayments(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("payments")
    .select("id, amount, due_date, week_number, status, rental:rentals!inner(id, contract_number, client:clients!inner(full_name, phone), truck:trucks!inner(unit_number))")
    .eq("status", "pending")
    .lt("due_date", today)
    .order("due_date", { ascending: true })
    .limit(10);

  return (data as Row[]) ?? [];
}

export async function getOverdueCount() {
  const supabase = createServiceSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("due_date", today);

  return count ?? 0;
}

export async function getPendingRentals(): Promise<Row[]> {
  const supabase = createServiceSupabase();

  const { data } = await supabase
    .from("rentals")
    .select("id, contract_number, start_date, weekly_rate, status, client:clients!inner(full_name, phone), truck:trucks!inner(unit_number)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  return (data as Row[]) ?? [];
}

export async function getUpcomingRenewals(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const today = new Date().toISOString().split("T")[0];
  const thirtyDays = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("rentals")
    .select("id, contract_number, expected_end_date, weekly_rate, client:clients!inner(full_name), truck:trucks!inner(unit_number)")
    .eq("status", "active")
    .gte("expected_end_date", today)
    .lte("expected_end_date", thirtyDays)
    .order("expected_end_date", { ascending: true })
    .limit(5);

  return (data as Row[]) ?? [];
}

export async function getUpcomingMaintenance(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const today = new Date().toISOString().split("T")[0];
  const fourteenDays = new Date(Date.now() + 14 * 86400000)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("maintenance_records")
    .select("id, type, next_due_date, truck:trucks!inner(unit_number)")
    .gte("next_due_date", today)
    .lte("next_due_date", fourteenDays)
    .order("next_due_date", { ascending: true })
    .limit(5);

  return (data as Row[]) ?? [];
}

export async function getTrucks(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("trucks")
    .select("*")
    .order("unit_number");
  return (data as Row[]) ?? [];
}

export async function getTruckById(id: string): Promise<Row | null> {
  const supabase = createServiceSupabase();
  const { data } = await supabase.from("trucks").select("*").eq("id", id).single();
  return (data as Row) ?? null;
}

export async function getTruckRentals(truckId: string): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("rentals")
    .select("id, contract_number, start_date, expected_end_date, status, weekly_rate, client:clients!inner(full_name)")
    .eq("truck_id", truckId)
    .order("start_date", { ascending: false });
  return (data as Row[]) ?? [];
}

export async function getTruckMaintenance(truckId: string): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("maintenance_records")
    .select("*")
    .eq("truck_id", truckId)
    .order("date", { ascending: false });
  return (data as Row[]) ?? [];
}

export async function getClients(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("full_name");
  return (data as Row[]) ?? [];
}

export async function getClientById(id: string): Promise<Row | null> {
  const supabase = createServiceSupabase();
  const { data } = await supabase.from("clients").select("*").eq("id", id).single();
  return (data as Row) ?? null;
}

export async function getClientRentals(clientId: string): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("rentals")
    .select("id, contract_number, start_date, expected_end_date, status, weekly_rate, truck:trucks!inner(unit_number)")
    .eq("client_id", clientId)
    .order("start_date", { ascending: false });
  return (data as Row[]) ?? [];
}

export async function getRentals(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("rentals")
    .select("id, contract_number, start_date, expected_end_date, weekly_rate, status, payment_day, client:clients!inner(full_name), truck:trucks!inner(unit_number)")
    .order("created_at", { ascending: false });
  return (data as Row[]) ?? [];
}

export async function getRentalById(id: string): Promise<Row | null> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("rentals")
    .select("*, client:clients!inner(*), truck:trucks!inner(*)")
    .eq("id", id)
    .single();
  return (data as Row) ?? null;
}

export async function getRentalPayments(rentalId: string): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("rental_id", rentalId)
    .order("week_number", { ascending: true });
  return (data as Row[]) ?? [];
}

export async function getPayments(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("payments")
    .select("id, amount, due_date, paid_date, week_number, status, method, rental:rentals!inner(id, contract_number, client:clients!inner(full_name))")
    .order("due_date", { ascending: false })
    .limit(100);
  return (data as Row[]) ?? [];
}

export async function getMaintenanceRecords(): Promise<Row[]> {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("maintenance_records")
    .select("id, type, date, cost, vendor, next_due_date, notes, mileage, truck:trucks!inner(unit_number)")
    .order("date", { ascending: false });
  return (data as Row[]) ?? [];
}
