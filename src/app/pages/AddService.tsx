import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PersianDatePicker } from '../components/PersianDatePicker';
import { ArrowRight } from 'lucide-react';
import { SERVICE_TYPES, ServiceType } from '../types';
import { Product } from '../data/products';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function AddService() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId, serviceType } = useParams<{ vehicleId: string; serviceType: ServiceType }>();
  const { vehicles, addService, addTransaction } = useApp();
  
  const product = location.state?.product as Product | undefined;
  const vehicle = vehicles.find(v => v.id === vehicleId);

  const [formData, setFormData] = useState({
    currentKilometers: vehicle?.currentKilometers || 0,
    nextServiceKilometers: (vehicle?.currentKilometers || 0) + 5000,
    serviceDate: new Date(),
    notes: product ? `محصول: ${product.name}${product.brand ? ` - ${product.brand}` : ''}` : '',
    cost: product?.price || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle || !serviceType) {
      return;
    }

    addService({
      vehicleId: vehicle.id,
      type: serviceType,
      currentKilometers: formData.currentKilometers,
      nextServiceKilometers: formData.nextServiceKilometers,
      serviceDate: new Date(formData.serviceDate),
      notes: formData.notes,
      cost: formData.cost,
    });

    if (formData.cost > 0) {
      addTransaction({
        vehicleId: vehicle.id,
        amount: formData.cost,
        date: new Date(formData.serviceDate),
        description: `${SERVICE_TYPES[serviceType]}${product ? ` - ${product.name}` : ''} - ${vehicle.brand} ${vehicle.model}`,
        status: 'paid',
      });
    }

    navigate(`/vehicles/${vehicleId}`);
  };

  if (!vehicle || !serviceType) {
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
          onClick={() => navigate(`/vehicles/${vehicleId}/service/${serviceType}/products`)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">ثبت {SERVICE_TYPES[serviceType]}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
      </div>

      {/* Selected Product Card */}
      {product && (
        <Card className="border-[#3B82F6]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">محصول انتخاب شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                )}
                <p className="text-lg font-medium text-[#3B82F6] mt-2">
                  {product.price.toLocaleString('fa-IR')} تومان
                </p>
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
                onChange={(e) => setFormData({ ...formData, currentKilometers: parseInt(e.target.value) || 0 })}
                min="0"
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextKm">کیلومتر سرویس بعدی</Label>
              <Input
                id="nextKm"
                type="number"
                value={formData.nextServiceKilometers}
                onChange={(e) => setFormData({ ...formData, nextServiceKilometers: parseInt(e.target.value) || 0 })}
                min={formData.currentKilometers}
                dir="ltr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDate">تاریخ انجام سرویس</Label>
              <PersianDatePicker
                value={formData.serviceDate}
                onChange={(date) => setFormData({ ...formData, serviceDate: date })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">هزینه (تومان)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                min="0"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">توضیحات (اختیاری)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              ثبت سرویس
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}