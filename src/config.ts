// تنظیمات اپلیکیشن

export const config = {
  // استفاده از دیتابیس یا localStorage
  // true = استفاده از Supabase
  // false = استفاده از localStorage
  USE_DATABASE: true,

  // آدرس webhook برای normalize کردن اطلاعات خودرو
  NORMALIZE_CAR_WEBHOOK:
    "https://n8n.carpeyma.com/webhook/carpeyma/normalize-car",

  // کد OTP ثابت برای development
  FIXED_OTP_CODE: "1111",
};