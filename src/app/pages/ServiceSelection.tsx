import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Wrench } from 'lucide-react';

export default function ServiceSelection() {
  const navigate = useNavigate();
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { serviceItems, loadServiceItems } = useApp();

  useEffect(() => {
    loadServiceItems();
  }, []);

  const handleServiceClick = (serviceId: string, serviceName: string) => {
    // ذخیره اطلاعات سرویس انتخاب شده برای استفاده در صفحه بعد
    sessionStorage.setItem('selectedServiceId', serviceId);
    sessionStorage.setItem('selectedServiceName', serviceName);
    navigate(`/vehicles/${vehicleId}/service/${serviceId}/products`);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/vehicles/${vehicleId}`)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">انتخاب سرویس</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نوع سرویس مورد نظر را انتخاب کنید
          </p>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-2 gap-4">
        {serviceItems.map((service) => {
          return (
            <Card
              key={service.id}
              className="cursor-pointer hover:shadow-lg hover:border-[#3B82F6] transition-all active:scale-95"
              onClick={() => handleServiceClick(service.id, service.nameFa)}
            >
              <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                {service.imageUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted">
                    <img
                      src={service.imageUrl}
                      alt={service.nameFa}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                )}
                <h3 className="font-medium text-center">{service.nameFa}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {serviceItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">در حال بارگذاری سرویس‌ها...</p>
        </div>
      )}
    </div>
  );
}
