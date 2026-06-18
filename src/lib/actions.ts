"use server";

import { revalidatePath } from "next/cache";
import { createServiceSupabase } from "@/lib/supabase/server";
import { generateContractNumber, getWeekStart, addWeeks } from "@/lib/format";

interface CreateRentalInput {
  clientId: string;
  truckId: string;
  startDate: string;
  expectedEndDate?: string;
  weeklyRate: number;
  depositPaid?: number;
  paymentDay: string;
  notes?: string;
}

export async function createRental(input: CreateRentalInput) {
  const supabase = createServiceSupabase();
  const contractNumber = generateContractNumber();

  const { data: rental, error } = await supabase
    .from("rentals")
    .insert({
      contract_number: contractNumber,
      client_id: input.clientId,
      truck_id: input.truckId,
      start_date: input.startDate,
      expected_end_date: input.expectedEndDate || null,
      weekly_rate: input.weeklyRate,
      deposit_paid: input.depositPaid ?? 0,
      payment_day: input.paymentDay,
      status: "active",
      notes: input.notes ?? null,
      documents_signed: false,
      insurance_verified: false,
    })
    .select()
    .single();

  if (error || !rental) {
    return { success: false, error: error?.message ?? "Failed to create rental" };
  }

  // Update truck status to rented
  await supabase
    .from("trucks")
    .update({ status: "rented" })
    .eq("id", input.truckId);

  // Generate weekly payment schedule
  const start = new Date(input.startDate);
  const end = input.expectedEndDate
    ? new Date(input.expectedEndDate)
    : addWeeks(start, 52); // default 1 year

  const payments = [];
  let weekStart = getWeekStart(start);
  let weekNum = 1;

  while (weekStart < end) {
    const dueDate = addWeeks(weekStart, 1);
    payments.push({
      rental_id: rental.id,
      week_number: weekNum,
      amount: input.weeklyRate,
      due_date: dueDate.toISOString().split("T")[0],
      status: "pending",
    });
    weekStart = addWeeks(weekStart, 1);
    weekNum++;
  }

  if (payments.length > 0) {
    await supabase.from("payments").insert(payments);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/rentals");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/fleet");

  return { success: true, rentalId: rental.id };
}

export async function approveRental(rentalId: string) {
  const supabase = createServiceSupabase();
  const { error } = await supabase
    .from("rentals")
    .update({ status: "active" })
    .eq("id", rentalId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/rentals");
  return { success: true };
}

export async function completeRental(rentalId: string) {
  const supabase = createServiceSupabase();

  const { data: rental } = await supabase
    .from("rentals")
    .select("truck_id")
    .eq("id", rentalId)
    .single();

  const { error } = await supabase
    .from("rentals")
    .update({
      status: "completed",
      actual_end_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", rentalId);

  if (error) return { success: false, error: error.message };

  // Return truck to available
  if (rental?.truck_id) {
    await supabase
      .from("trucks")
      .update({ status: "available" })
      .eq("id", rental.truck_id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/rentals");
  revalidatePath("/dashboard/fleet");
  return { success: true };
}

interface LogPaymentInput {
  paymentId: string;
  method: string;
  paidDate: string;
}

export async function logPayment(input: LogPaymentInput) {
  const supabase = createServiceSupabase();

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      method: input.method,
      paid_date: input.paidDate,
    })
    .eq("id", input.paymentId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  return { success: true };
}

interface CreateMaintenanceInput {
  truckId: string;
  type: string;
  date: string;
  mileage?: number;
  vendor?: string;
  cost?: number;
  nextDueDate?: string;
  nextDueMileage?: number;
  notes?: string;
}

export async function createMaintenance(input: CreateMaintenanceInput) {
  const supabase = createServiceSupabase();

  const { error } = await supabase.from("maintenance_records").insert({
    truck_id: input.truckId,
    type: input.type,
    date: input.date,
    mileage: input.mileage ?? null,
    vendor: input.vendor ?? null,
    cost: input.cost ?? null,
    next_due_date: input.nextDueDate ?? null,
    next_due_mileage: input.nextDueMileage ?? null,
    notes: input.notes ?? null,
  });

  if (error) return { success: false, error: error.message };

  // Update truck's last service and next service dates
  await supabase
    .from("trucks")
    .update({
      last_service_date: input.date,
      next_service_due: input.nextDueDate ?? undefined,
      mileage: input.mileage ?? undefined,
    })
    .eq("id", input.truckId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/fleet");
  revalidatePath("/dashboard/maintenance");
  return { success: true };
}
