import { config } from "../config";
import { NormalizeCarResponse } from "../app/types";

/**
 * فراخوانی webhook برای normalize کردن اطلاعات خودرو
 */
export async function normalizeCarInfo(
  userId: string,
  carModel: string, // قبلاً carName بود - این همان مدل خودروست (مثلاً "206")
  carBrand?: string, // قبلاً model بود - این همان برند خودروست (مثلاً "پژو")
): Promise<NormalizeCarResponse> {
  try {
    const response = await fetch(config.NORMALIZE_CAR_WEBHOOK, {
      method: "POST",
      mode: "cors", // ✨ اضافه کنید
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        car_name: carModel, // مدل خودرو (مثلاً "206")
        model: carBrand || "", // برند خودرو (مثلاً "پژو")
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NormalizeCarResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to normalize car info");
    }

    return data;
  } catch (error) {
    console.error("Error normalizing car info:", error);

    // در صورت خطا، یک پاسخ پیش‌فرض برمی‌گردانیم
    return {
      success: true,
      user_id: userId,
      car: {
        name_fa: carModel, // مدل خودرو
        brand_fa: carBrand || "", // برند خودرو
        display_name_fa: carBrand
          ? `${carBrand} ${carModel}`
          : carModel,
        normalized_name_en: carModel,
        needs_review: true,
        // اضافه کردن فیلدهای بیشتر برای سازگاری با تایپ
        brand_en: "",
        name_en: "",
        model_fa: "",
        model_en: "",
        image_url: "",
        simple_image_query_fa: "",
        image_source: "",
        confidence: 0,
      },
    };
  }
}