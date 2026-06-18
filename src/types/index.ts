export interface Truck {
  id: string;
  unit_number: string;
  vin: string | null;
  make: string;
  model: string | null;
  year: number | null;
  box_length: string | null;
  mileage: number;
  status: string;
  weekly_rate: number;
  deposit_amount: number;
  insurance_expiry: string | null;
  registration_expiry: string | null;
  last_service_date: string | null;
  next_service_due: string | null;
  location: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  company_name: string | null;
  license_number: string | null;
  license_expiry: string | null;
  insurance_provider: string | null;
  dot_number: string | null;
  client_type: string;
  status: string;
  referral_source: string;
  total_rentals: number;
  on_time_payment_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  contract_number: string;
  client_id: string;
  truck_id: string;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  weekly_rate: number;
  deposit_paid: number;
  payment_day: string;
  status: string;
  mileage_start: number | null;
  mileage_end: number | null;
  documents_signed: boolean;
  insurance_verified: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  truck?: Truck;
}

export interface Payment {
  id: string;
  rental_id: string;
  week_number: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  method: string | null;
  notes: string | null;
  created_at: string;
  rental?: {
    id: string;
    contract_number: string;
    client?: { full_name: string };
  };
}

export interface MaintenanceRecord {
  id: string;
  truck_id: string;
  type: string;
  date: string;
  mileage: number | null;
  vendor: string | null;
  cost: number | null;
  next_due_date: string | null;
  next_due_mileage: number | null;
  notes: string | null;
  invoice_url: string | null;
  created_at: string;
  truck?: { unit_number: string };
}
