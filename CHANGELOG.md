# تغییرات جدید کارپیما

## ویژگی‌های جدید

### 1. سیستم Normalize خودرو با Webhook
- هنگام افزودن یا ویرایش خودرو، اطلاعات به webhook ارسال می‌شود
- اطلاعات normalize شده (برند، مدل، تصویر) دریافت و ذخیره می‌شود
- Endpoint: `https://n8n.carpeyma.com/webhook/carpeyma/normalize-car`

### 2. نمایش تصویر خودرو
- تصویر خودرو در Dashboard نمایش داده می‌شود
- تصویر در کنار نام خودرو با ابعاد 64x64 پیکسل

### 3. ساختار جدید جدول vehicles
```sql
- brand_fa / brand_en: برند به دو زبان
- name_fa / name_en: نام خودرو
- model_fa / model_en: مدل خودرو
- display_name_fa: نام کامل نمایشی (مثلاً "پژو 206 تیپ 5")
- normalized_name_en: نام استاندارد انگلیسی
- production_year: سال تولید (به جای year)
- current_km: کیلومتر فعلی
- plate_number: پلاک با فرمت "xx $ yyy zz"
- image_url: آدرس تصویر خودرو
- simple_image_query_fa: کوئری جستجوی تصویر
- image_source: منبع تصویر
- confidence: میزان اطمینان (0-1)
- needs_review: نیاز به بررسی دستی
```

### 4. فرمت جدید پلاک
- فرمت قدیم: `12الف345-11`
- فرمت جدید: `12 الف 345 11`
- قسمت اول (xx): دو رقم
- حرف ($): یک کاراکتر فارسی
- قسمت دوم (yyy): سه رقم
- قسمت سوم (zz): دو رقم (کد شهر)

### 5. کد OTP ثابت
- کد OTP همیشه: `1111`
- برای راحتی توسعه و تست

### 6. حالت Database/localStorage
```typescript
// در فایل src/config.ts
USE_DATABASE: false  // true برای استفاده از Supabase، false برای localStorage
```

## تغییرات در فایل‌ها

### فایل‌های جدید:
- `src/config.ts` - تنظیمات اپلیکیشن
- `src/lib/plateHelper.ts` - مدیریت پلاک
- `src/lib/carService.ts` - فراخوانی webhook normalize
- `src/app/types.ts` - تایپ‌های جدید Vehicle و NormalizeCarResponse

### فایل‌های آپدیت شده:
- `src/app/context/AppContext.tsx` - لاجیک جدید addVehicle و updateVehicle
- `src/app/pages/AddVehicle.tsx` - فیلدهای nameFa و modelFa
- `src/app/pages/Dashboard.tsx` - نمایش تصویر خودرو
- `src/app/components/PlateDisplay.tsx` - فرمت جدید پلاک
- `src/lib/otpHelper.ts` - کد ثابت 1111

## نحوه استفاده

### 1. تنظیم حالت کاری
```typescript
// src/config.ts
export const config = {
  USE_DATABASE: false,  // تغییر به true برای استفاده از دیتابیس
};
```

### 2. افزودن خودرو
1. کاربر نام خودرو را وارد می‌کند (مثلاً "206")
2. مدل را وارد می‌کند (مثلاً "تیپ 5") - اختیاری
3. پس از ذخیره، webhook فراخوانی می‌شود
4. اطلاعات normalize شده (شامل تصویر) دریافت و ذخیره می‌شود

### 3. نمایش خودرو
- تصویر خودرو در Dashboard نمایش داده می‌شود
- نام نمایشی از `displayNameFa` استفاده می‌شود
- پلاک با فرمت جدید نمایش داده می‌شود

## نکات مهم

⚠️ **Webhook**: مطمئن شوید که endpoint webhook در دسترس است
⚠️ **Database**: برای استفاده از database، جدول vehicles را با ساختار جدید ایجاد کنید
⚠️ **OTP**: کد همیشه 1111 است - فقط برای development
⚠️ **پلاک**: فرمت جدید با فاصله: `12 الف 345 11`

## مثال Webhook Response

```json
{
  "success": true,
  "user_id": "user123",
  "car": {
    "brand_fa": "پژو",
    "brand_en": "Peugeot",
    "name_fa": "206",
    "name_en": "206",
    "model_fa": "تیپ 5",
    "model_en": "Type 5",
    "display_name_fa": "پژو 206 تیپ 5",
    "normalized_name_en": "Peugeot 206 Type 5",
    "image_url": "https://example.com/car.jpg",
    "simple_image_query_fa": "تصویر پژو 206 تیپ 5",
    "image_source": "serpapi_google_images",
    "confidence": 0.95,
    "needs_review": false
  }
}
```

## SQL برای ایجاد جدول جدید

```sql
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_fa TEXT,
  brand_en TEXT,
  name_fa TEXT NOT NULL,
  name_en TEXT,
  model_fa TEXT,
  model_en TEXT,
  display_name_fa TEXT,
  normalized_name_en TEXT,
  production_year INTEGER NOT NULL,
  current_km INTEGER NOT NULL,
  plate_number TEXT,
  image_url TEXT,
  simple_image_query_fa TEXT,
  image_source TEXT,
  confidence FLOAT,
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
