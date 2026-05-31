# راهنمای راه‌اندازی Supabase برای کارپیما

## مرحله 1: اجرای SQL Functions

1. وارد پنل Supabase شوید
2. به بخش **SQL Editor** بروید
3. محتوای فایل `supabase_functions.sql` را کپی کنید
4. در SQL Editor پیست کنید و **Run** را بزنید

این کار سه function زیر را ایجاد می‌کند:
- `create_otp(p_phone_number)` - برای ایجاد کد OTP 4 رقمی
- `verify_otp_and_login(p_phone_number, p_code)` - برای بررسی OTP و ایجاد/ورود کاربر
- `get_profile_by_user_id(p_user_id)` - برای دریافت اطلاعات پروفایل

## مرحله 2: بررسی جداول

مطمئن شوید که جداول زیر با ساختار مشخص شده ایجاد شده‌اند:

### جدول `profiles`
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    province TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### جدول `otp_codes`
```sql
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    code TEXT NOT NOT,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### جدول `vehicles`
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate TEXT,
    current_km INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### جدول `services`
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    km_at_service INTEGER NOT NULL,
    next_service_km INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### جدول `transactions`
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## مرحله 3: تنظیم Row Level Security (RLS)

برای امنیت بیشتر، RLS را برای جداول فعال کنید:

```sql
-- فعال‌سازی RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy برای profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Policy برای vehicles
CREATE POLICY "Users can view their own vehicles"
    ON vehicles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own vehicles"
    ON vehicles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vehicles"
    ON vehicles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own vehicles"
    ON vehicles FOR DELETE
    USING (user_id = auth.uid());

-- Policy برای services
CREATE POLICY "Users can view services of their vehicles"
    ON services FOR SELECT
    USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert services for their vehicles"
    ON services FOR INSERT
    WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update services of their vehicles"
    ON services FOR UPDATE
    USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete services of their vehicles"
    ON services FOR DELETE
    USING (vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid()));

-- Policy برای transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

## مرحله 4: تست کردن

برای تست کردن سیستم OTP:

1. اپلیکیشن را اجرا کنید
2. شماره موبایل خود را وارد کنید
3. در Console مرورگر (F12 → Console)، کد OTP نمایش داده می‌شود (فقط در حالت Development)
4. کد را وارد کنید و تایید کنید

## نکات مهم

- **محیط توسعه**: در حالت development، کد OTP در console نمایش داده می‌شود
- **محیط تولید**: برای محیط production باید یک سرویس SMS (مثل Kavenegar) پیکربندی کنید
- **امنیت**: کدهای OTP 5 دقیقه اعتبار دارند و حداکثر 5 بار قابل تلاش هستند
- **Session**: اطلاعات کاربر در localStorage با کلید `carpima_user_id` ذخیره می‌شود

## ارسال SMS در محیط تولید (اختیاری)

برای ارسال واقعی SMS، می‌توانید از سرویس‌های ایرانی مثل Kavenegar استفاده کنید.
یک Edge Function در Supabase ایجاد کنید که پس از ایجاد OTP، آن را از طریق API ارسال کند.

مثال:
```typescript
// supabase/functions/send-otp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { phone_number, code } = await req.json()
  
  // ارسال SMS از طریق API Kavenegar
  const response = await fetch('https://api.kavenegar.com/v1/YOUR_API_KEY/sms/send.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      receptor: phone_number,
      message: `کد تایید کارپیما: ${code}`
    })
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```
