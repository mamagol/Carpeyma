# پیاده‌سازی سیستم پیشنهاد سرویس و محصول

## تغییرات انجام‌شده

### 1. فایل‌های جدید

#### `src/lib/iranCities.ts`
- لیست کامل استان‌ها و شهرهای ایران
- توابع `getProvinceNames()` و `getCitiesByProvince()`

#### `src/lib/serviceRecommendation.ts`
- تابع `getProductRecommendations()` برای فراخوانی webhook
- Endpoint: `https://n8n.carpeyma.com/webhook/carpeyma/recommend-products`

### 2. آپدیت تایپ‌ها (`src/app/types.ts`)

```typescript
// تایپ‌های جدید اضافه شده:
- ServiceItem: سرویس‌های سیستم
- RecommendedProduct: محصولات پیشنهادی
- RecommendProductsResponse: پاسخ webhook
- UserVehicleService: رکورد سرویس کاربر
- User: فیلدهای province و city اضافه شد
```

### 3. AppContext (`src/app/context/AppContext.tsx`)

**State جدید:**
- `serviceItems: ServiceItem[]`

**توابع جدید:**
- `loadServiceItems()`: بارگذاری سرویس‌ها از `public.services`

**آپدیت توابع:**
- `updateUser()`: پشتیبانی از `province` و `city`
- `loadUserData()`: بارگذاری `province` و `city`

### 4. صفحات

#### `ServiceSelection.tsx` - کامل بازنویسی
- لیست سرویس‌ها از جدول `public.services`
- نمایش تصویر سرویس
- ذخیره اطلاعات سرویس انتخاب شده در `sessionStorage`

#### `ProductSelection.tsx` - کامل بازنویسی
- فراخوانی webhook برای دریافت محصولات پیشنهادی
- نمایش لیست محصولات با تصویر
- آیکون `Info` برای مشاهده جزئیات محصول
- Bottom Sheet برای نمایش جزئیات کامل
- ذخیره محصول انتخاب شده در `sessionStorage`

#### `AddService.tsx` - کامل بازنویسی
- کیلومتر فعلی به عنوان پیش‌فرض
- کیلومتر بعدی = `current_km + usable_km.max`
- تاریخ امروز پیش‌فرض (فقط گذشته قابل انتخاب)
- حذف فیلد هزینه
- دیالوگ تایید آپدیت کیلومتر خودرو
- ذخیره در `user_vehicle_services` و `user_vehicle_service_products`

#### `Profile.tsx`
- فیلد Select برای انتخاب استان
- فیلد Select برای انتخاب شهر (وابسته به استان)
- نمایش استان و شهر در بخش اطلاعات

### 5. Routes (`src/app/routes.tsx`)
- پارامتر `serviceType` به `serviceId` تغییر یافت

## ساختار جداول مورد نیاز

### `public.services`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name_fa TEXT NOT NULL UNIQUE,
name_en TEXT NOT NULL UNIQUE,
image_url TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### `public.profiles`
```sql
-- فیلدهای جدید:
province TEXT,
city TEXT,
```

### `public.user_vehicle_services`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
service_date TIMESTAMPTZ DEFAULT NOW(),
current_km_at_service INTEGER NOT NULL,
notes TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### `public.user_vehicle_service_products`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_vehicle_service_id UUID NOT NULL REFERENCES public.user_vehicle_services(id) ON DELETE CASCADE,
product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
product_snapshot JSONB NOT NULL,
replacement_after_months INTEGER,
usable_km_min INTEGER,
usable_km_max INTEGER,
next_service_km INTEGER,
confidence FLOAT,
needs_review BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
```

## فلوی کاربر

1. **انتخاب سرویس** (`ServiceSelection`)
   - کاربر سرویس مورد نظر را انتخاب می‌کند
   - اطلاعات در `sessionStorage` ذخیره می‌شود

2. **دریافت پیشنهاد محصولات** (`ProductSelection`)
   - Webhook فراخوانی می‌شود
   - اطلاعات ارسالی: `user_id`, `service_name`, `car_brand`, `car_name`, `car_model`, `year`, `current_km`, `city`
   - لیست محصولات نمایش داده می‌شود
   - کاربر می‌تواند جزئیات را ببیند
   - محصول انتخابی در `sessionStorage` ذخیره می‌شود

3. **ثبت سرویس** (`AddService`)
   - فرم با مقادیر پیش‌فرض پر می‌شود
   - کاربر اطلاعات را تایید یا ویرایش می‌کند
   - در صورت تغییر کیلومتر، دیالوگ تایید نمایش داده می‌شود
   - ذخیره در دیتابیس یا localStorage

## حالت Database vs localStorage

```typescript
// در src/config.ts
USE_DATABASE: false  // false = localStorage, true = Supabase
```

### localStorage Mode
- سرویس‌ها: لیست پیش‌فرض
- استان‌ها و شهرها: از فایل `iranCities.ts`
- ذخیره‌سازی: `carpima_user_services` و `carpima_service_products`

### Database Mode
- سرویس‌ها: از جدول `public.services`
- ذخیره‌سازی: جداول `user_vehicle_services` و `user_vehicle_service_products`

## نکات مهم

1. **Webhook**: باید endpoint در دسترس باشد
2. **SessionStorage**: برای انتقال داده بین صفحات
3. **استان/شهر**: کاربر باید حتماً انتخاب کند
4. **کیلومتر**: حداقل برابر با کیلومتر فعلی خودرو
5. **تاریخ**: فقط امروز و گذشته
6. **محصول**: اطلاعات کامل در `product_snapshot` ذخیره می‌شود

## Webhook Request Example

```json
{
  "user_id": "123",
  "service_name": "تعویض روغن",
  "car_brand": "پژو",
  "car_name": "206",
  "car_model": "تیپ 5",
  "year": 1398,
  "current_km": 85000,
  "city": "تهران"
}
```

## Webhook Response Example

```json
{
  "success": true,
  "user_id": "123",
  "service_name": "تعویض روغن",
  "vehicle": {
    "brand_fa": "پژو",
    "name_fa": "206",
    "model_fa": "تیپ 5",
    "year": 1398,
    "current_km": 85000,
    "city": "تهران"
  },
  "products": [
    {
      "product_name_fa": "روغن موتور 10W-40",
      "product_brand_fa": "بهران",
      "product_category_fa": "روغن موتور",
      "image_url": "https://...",
      "replacement_after_months": 6,
      "usable_km": {
        "min": 5000,
        "max": 7000
      },
      "next_service_km": 92000,
      "specs": {
        "viscosity": "10W-40",
        "oil_type": "نیمه سنتتیک"
      },
      "reason_fa": "گزینه مناسب برای این خودرو",
      "confidence": 0.85,
      "needs_review": false
    }
  ]
}
```

## تست

1. ورود با کد OTP: `1111`
2. تکمیل پروفایل (نام، استان، شهر)
3. افزودن خودرو
4. انتخاب خودرو → ثبت سرویس
5. انتخاب نوع سرویس
6. مشاهده محصولات پیشنهادی
7. انتخاب محصول
8. ثبت سرویس

همه چیز آماده است! 🎉
