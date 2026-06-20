const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://212.227.251.228:8000/api";

export interface TruckStats {
  available: number;
  rented: number;
  maintenance: number;
  overduePayments: number;
  totalTrucks: number;
}

export interface DashboardData {
  stats: TruckStats;
  pendingRentals: number;
  upcomingRenewals: number;
}

export interface Truck {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  status: string;
  weeklyRate: number;
  boxLength: string;
  location: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  driverType: string;
  status: string;
  totalRentals: number;
  onTimePaymentRate: number;
  referralSource: string;
}

export interface Rental {
  id: string;
  contractNumber: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string;
  status: string;
  weeklyRate: number;
  paymentDay: string;
  mileageStart: number;
  mileageEnd: number;
  documentsSigned: boolean;
  insuranceVerified: boolean;
  truckId: string;
  driverId: string;
  notes: string;
}

export interface Payment {
  id: string;
  weekNumber: number;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: string;
  method: string;
  rentalId: string;
}

export interface OverduePayment extends Payment {
  contractNumber: string;
  driverName: string;
}

export interface MaintenanceRecord {
  id: string;
  serviceType: string;
  date: string;
  mileage: number;
  vendor: string;
  cost: number;
  nextDueDate: string;
  truckId: string;
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Dashboard
export const getDashboard = () => api<DashboardData>("/dashboard");

// Trucks
export const getTrucks = () => api<Truck[]>("/trucks");
export const getTruck = (id: string) => api<Truck>(`/trucks/${id}`);

// Drivers
export const getDrivers = () => api<Driver[]>("/drivers");

// Rentals
export const getRentals = () => api<Rental[]>("/rentals");
export const getRental = (id: string) => api<Rental & { payments: Payment[] }>(`/rentals/${id}`);

// Payments
export const getPayments = () => api<Payment[]>("/payments");
export const getOverduePayments = () => api<OverduePayment[]>("/payments/overdue");

// Maintenance
export const getMaintenance = () => api<MaintenanceRecord[]>("/maintenance");
