import { config } from '../config';
import { RecommendProductsResponse } from '../app/types';
/**
 * فراخوانی webhook برای دریافت پیشنهاد محصولات
 */
export async function getProductRecommendations(params: {
  userId: string;
  serviceName: string;
  carBrand?: string;
  carName?: string;
  carModel?: string;
  year: number;
  currentKm: number;
  city?: string;
}): Promise<RecommendProductsResponse> {
  try {
    const response = await fetch('https://n8n.carpeyma.com/webhook/carpeyma/recommend-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: params.userId,
        service_name: params.serviceName,
        car_brand: params.carBrand || '',
        car_name: params.carName || '',
        car_model: params.carModel || '',
        year: params.year,
        current_km: params.currentKm,
        city: params.city || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RecommendProductsResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to get product recommendations');
    }

    return data;
  } catch (error) {
    console.error('Error getting product recommendations:', error);

    // پاسخ پیش‌فرض در صورت خطا
    return {
      success: true,
      user_id: params.userId,
      service_name: params.serviceName,
      vehicle: {
        brand_fa: params.carBrand,
        name_fa: params.carName,
        model_fa: params.carModel,
        year: params.year,
        current_km: params.currentKm,
        city: params.city,
      },
      products: [],
    };
  }
}
