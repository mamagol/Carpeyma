import { createClient } from "@supabase/supabase-js";

// اطلاعات اتصال به Supabase
const supabaseUrl = "https://db.carpeyma.com";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgwMTU4MjMzLCJleHAiOjE5Mzc4MzgyMzN9.36npIG0RK_Fjmjh1VsoRUmNlbjs1c6_NikWfM0nOkfk";

// ایجاد کلاینت Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// تایپ‌های TypeScript برای جداول (می‌تونی بعداً اینها رو کامل‌تر کنی)
export interface User {
  id: string;
  phone: string;
  name?: string;
  created_at?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  plate: string;
  name?: string;
  model?: string;
  year?: number;
  current_km: number;
  created_at?: string;
}

export interface Service {
  id: string;
  vehicle_id: string;
  service_type: string;
  product_name?: string;
  km_at_service: number;
  service_interval: number;
  next_service_km: number;
  cost?: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  vehicle_id?: string;
  service_id?: string;
  amount: number;
  type: "income" | "expense";
  description?: string;
  date: string;
  created_at?: string;
}