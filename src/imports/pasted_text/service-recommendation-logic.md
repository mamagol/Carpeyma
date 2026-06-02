
وقتی کاربر یک سرویس جدید را انتخاب میکند باید لیست سرویس‌ها از جدول public.services دریافت شود
ساختار جدول به شرح زیر است:

   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_fa TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()

نکته: name_en نیازی به نمایش به کاربر نیست و فقط name_fa رو به کاربر نشون میدیم و تصویر خدمت هم که از image_url دریافت میشه.

بعد از اینکه یک خدمت انتخاب کرد باید وب سرویس زیر صدا زده بشه:
POST https://n8n.carpeyma.com/webhook/carpeyma/recommend-products

Content-Type: application/json
{
 "user_id": "",
 "service_name": "تعویض روغن",
 "car_brand": "پژو",
 "car_name": "206",
 "car_model": "تیپ 5",
 "year": 1398,
 "current_km": 85000,
 "city": "تهران"
}

در مثالی که نوشتم user_id که id کاربر لاگین شده است، service_name نام فارسی سرویس (خدمت) است یعنی name_fa، card_brand که مدل خودرو است (brand_fa) و car_name که نام خودرو است (normalized_name_en) و car_model که مدل خودرو است (model_fa) و year باید فیلد production_year باشد و current_km هم فیلد current_km است. city هم باید از فیلد city کاربر لاگین شده از جدول profiles دریافت بشه.

ریسپانس این وب سرویس به شکل زیر است: (ریسپانس زیر مثال است)

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
     "product_name_fa": "روغن موتور 10W-40 نیمه سنتتیک 4 لیتری",
     "product_brand_fa": "بهران",
     "product_category_fa": "روغن موتور",
     "image_url": "https://example.com/product-image.jpg",
     "product_search_query_fa": "تصویر روغن موتور بهران 10W-40 چهار لیتری",
     "replacement_after_months": 6,
     "usable_km": {
       "min": 5000,
       "max": 7000
     },
     "next_service_km": 92000,
     "specs": {
       "viscosity": "10W-40",
       "oil_type": "نیمه سنتتیک",
       "volume_liter": 4,
       "standard": "API SL/SM"
     },
     "reason_fa": "برای سرویس دوره‌ای این خودرو با کارکرد فعلی گزینه‌ای رایج و مناسب است.",
     "confidence": 0.85,
     "needs_review": false
   }
 ]
}

اطلاعات products مربوط به لیست محصولاتی که برگشته رو باید نمایش بدی (مشابه چیزی که همین الان است) 
در لیست اولیه فقط باید اطلاعات اولیه مثل تصویر و product_name_fa و  product_brand_fa رو نمایش بدی و یک آیکن هم برای هر کدومش باشه که وقتی روش کلیک میشه اطلاعات بیشتر اون محصول با ui مناسب نمایش داده بشه (دقت بشه که باتم شیت لیست محصولات نباید بسته بشه)


وقتی کاربر یکی از محصولات رو انتخاب میکنه در فرم ثبت سرویس باید این موارد وجود داشته باشه:

در فیلد کیلومتر انجام سرویس باید کیلومتر فعلی خودرو (current_km) به صورت پیشفرض داخل input باشه.
در فیلد کیلومتر بعدی باید مجموع current_km و max از usable_km که در ریسپانس وجود داره قرار بگیره. 
در فیلد تاریخ انجام سرویس هم به صورت پیشفرض باید تاریخ امروز باشه و فقط هم تاریخ های امروز به قبل قابل انتخاب باشه و آینده قابل انتخاب نباشه.
در فیلد کیلومتر فعلی هم امکان انتخاب اعداد کوچکتر از current_km وجود ندارد. 
فیلد هزینه رو هم حذف کن.

نکته: اگر کاربر current_km را تعییر داد پس از ذخیره اطلاعات فرم در جدول مربوطه باید یک پیام به کاربر نشون بده و بگه میخوای کیلومتر فعلی خودرو رو به مقداری که وارد کردی تغییر بدم؟ و اگر بله رو انتخاب کرد باید این فیلد در جدول خودرو آپدیت بشه.

ذخیره اطلاعات باید در جدول user_vehicle_services ذخیره شود. ساختار جدول به شرح زیر است:


   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    service_date TIMESTAMPTZ DEFAULT NOW(),
    current_km_at_service INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
همچنین جزئیات محصول انتخاب شده هم باید در جدول user_vehicle_service_products ذخیره بشه. ساختار این جدول به شرح زیر است:

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

product_snapshot اطلاعات محصول به صورت جیسون ذخیره میشه
replacement_after_months که مقدار replacement_after_months ذخیره میشه
usable_km_min که min از usable_km ذخیره میشه
usable_km_max که max از usable_km ذخیره میشه
next_service_km هم که همون مجموع و max از usable_km ذخیره میشه
بقیه موارد هم که در ریسپانس وجود داره. منظورم confidence و needs_review است.


به عنوان آخرین کاری که باید انجام بدی اینکه فیلدهای انتخاب استان و شهر رو در صفحه ویرایش پروفایل اضافه کنی. 
هر ۲ فیلد باید از نوع select باشند و در فیلد انتخاب استان باید لیست همه استان‌های ایران قرار داشته باشد و وقتی که یک استان انتخاب میشه لیست همه شهرهای آن استان در فیلد انتخاب شهر نمایش داده شود. 
دقت کن که کاربر حتما باید استان و شهرش رو انتخاب کنه.

فیلدهای زیر از جدول profiles مربوط به استان و شهر انتخاب شده هستند:
province TEXT,
city TEXT,
