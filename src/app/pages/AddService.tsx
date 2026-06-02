import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { PersianDatePicker } from '../components/PersianDatePicker';
import { ArrowRight } from 'lucide-react';
import { RecommendedProduct } from '../types';
import { config } from '../../config';
import { supabase } from '../../lib/supabase';

export default function AddService() {
  const navigate = useNavigate();
  const { vehicleId, serviceId } = useParams<{ vehicleId: string; serviceId: string }>();
  const { user, vehicles, updateVehicle } = useApp();

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const serviceName = sessionStorage.getItem('selectedServiceName') || '';
  const productData = sessionStorage.getItem('selectedProduct');
  const product: RecommendedProduct | null = productData ? JSON.parse(productData) : null;

  const [showUpdateKmDialog, setShowUpdateKmDialog] = useState(false);
  const [formData, setFormData] = useState({
    currentKilometers: vehicle?.currentKilometers || 0,
    nextServiceKilometers:
      vehicle && product?.usableKm?.max
        ? vehicle.currentKilometers + product.usableKm.max
        : (vehicle?.currentKilometers || 0) + 5000,
    serviceDate: new Date(),
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle || !user || !serviceId) {
      return;
    }

    // بررسی تغییر کیلومتر
    if (formData.currentKilometers !== vehicle.currentKilometers) {
      setShowUpdateKmDialog(true);
      return;
    }

    await saveService(false);
  };

  const saveService = async (updateVehicleKm: boolean) => {
    if (!vehicle || !user || !serviceId) return;

    try {
      if (!config.USE_DATABASE) {
        // localStorage mode
        const serviceRecord = {
          id: Date.now().toString(),
          userId: user.id,
          vehicleId: vehicle.id,
          serviceId: serviceId,
          serviceDate: formData.serviceDate,
          currentKmAtService: formData.currentKilometers,
          notes: formData.notes,
        };

        // ذخیره در localStorage
        const storedServices = localStorage.getItem('carpima_user_services');
        const services = storedServices ? JSON.parse(storedServices) : [];
        services.push(serviceRecord);
        localStorage.setItem('carpima_user_services', JSON.stringify(services));

        if (product) {
          const productRecord = {
            id: Date.now().toString() + '_product',
            userVehicleServiceId: serviceRecord.id,
            productSnapshot: product,
            replacementAfterMonths: product.replacementAfterMonths,
            usableKmMin: product.usableKm?.min,
            usableKmMax: product.usableKm?.max,
            nextServiceKm: formData.nextServiceKilometers,
            confidence: product.confidence,
            needsReview: product.needsReview,
          };

          const storedProducts = localStorage.getItem('carpima_service_products');
          const products = storedProducts ? JSON.parse(storedProducts) : [];
          products.push(productRecord);
          localStorage.setItem('carpima_service_products', JSON.stringify(products));
        }

        // آپدیت کیلومتر خودرو اگر لازم باشه
        if (updateVehicleKm) {
          await updateVehicle(vehicle.id, {
            currentKilometers: formData.currentKilometers,
          });
        }

        navigate(`/vehicles/${vehicleId}`);
        return;
      }

      // Database mode
      const { data: serviceData, error: serviceError } = await supabase
        .from('user_vehicle_services')
        .insert({
          user_id: user.id,
          vehicle_id: vehicle.id,
          service_id: serviceId,
          service_date: formData.serviceDate.toISOString(),
          current_km_at_service: formData.currentKilometers,
          notes: formData.notes,
        })
        .select()
        .single();

      if (serviceError) {
        console.error('Error saving service:', serviceError);
        alert('خطا در ذخیره سرویس');
        return;
      }

      // ذخیره محصول
      if (product && serviceData) {
        const { error: productError } = await supabase
          .from('user_vehicle_service_products')
          .insert({
            user_vehicle_service_id: serviceData.id,
            product_snapshot: product,
            replacement_after_months: product.replacementAfterMonths,
            usable_km_min: product.usableKm?.min,
            usable_km_max: product.usableKm?.max,
            next_service_km: formData.nextServiceKilometers,
            confidence: product.confidence,
            needs_review: product.needsReview,
          });

        if (productError) {
          console.error('Error saving product:', productError);
        }
      }

      // آپدیت کیلومتر خودرو
      if (updateVehicleKm) {
        await updateVehicle(vehicle.id, {
          currentKilometers: formData.currentKilometers,
        });
      }

      // پاک کردن sessionStorage
      sessionStorage.removeItem('selectedServiceId');
      sessionStorage.removeItem('selectedServiceName');
      sessionStorage.removeItem('selectedProduct');

      navigate(`/vehicles/${vehicleId}`);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('خطا در ذخیره سرویس');
    }
  };

  if (!vehicle) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>اطلاعات یافت نشد</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              بازگشت
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">ثبت {serviceName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicle.displayNameFa || vehicle.nameFa}
          </p>
        </div>
      </div>

      {/* Selected Product Card */}
      {product && (
        <Card className="border-[#3B82F6]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">محصول انتخاب شده</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              {product.imageUrl && (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.productNameFa}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium">{product.productNameFa}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.productBrandFa}
                </p>
                {product.nextServiceKm && (
                  <p className="text-sm text-[#3B82F6] mt-2">
                    سرویس بعدی: {product.nextServiceKm.toLocaleString('fa-IR')} کیلومتر
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentKm">کیلومتر انجام سرویس</Label>
              <Input
                id="currentKm"
                type="number"
                value={formData.currentKilometers}
                onChange={(e) => setFormData({
                  ...formData,
                  currentKilometers: parseInt(e.target.value) || 0
                })}
                min={vehicle.currentKilometers}
                dir="ltr"
                required
              />
              <p className="text-xs text-muted-foreground">
                حداقل: {vehicle.currentKilometers.toLocaleString('fa-IR')} کیلومتر
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextKm">کیلومتر سرویس بعدی</Label>
              <Input
                id="nextKm"
                type="number"
                value={formData.nextServiceKilometers}
                onChange={(e) => setFormData({
                  ...formData,
                  nextServiceKilometers: parseInt(e.target.value) || 0
                })}
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <PersianDatePicker
                value={formData.serviceDate}
                onChange={(date) => setFormData({ ...formData, serviceDate: date })}
                label="تاریخ انجام سرویس"
                maxDate={new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">یادداشت (اختیاری)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="توضیحات اضافی در مورد سرویس..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                ثبت سرویس
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                لغو
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Update KM Dialog */}
      <AlertDialog open={showUpdateKmDialog} onOpenChange={setShowUpdateKmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آپدیت کیلومتر خودرو</AlertDialogTitle>
            <AlertDialogDescription>
              کیلومتر انجام سرویس ({formData.currentKilometers.toLocaleString('fa-IR')}) با کیلومتر فعلی خودرو ({vehicle.currentKilometers.toLocaleString('fa-IR')}) متفاوت است.
              <br /><br />
              آیا می‌خواهید کیلومتر فعلی خودرو را به {formData.currentKilometers.toLocaleString('fa-IR')} تغییر دهید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowUpdateKmDialog(false);
              saveService(false);
            }}>
              خیر، تغییر نده
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUpdateKmDialog(false);
                saveService(true);
              }}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90"
            >
              بله، تغییر بده
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
