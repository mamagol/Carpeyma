import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Droplet, Filter, Wind, Wrench, Clock, Package } from 'lucide-react';
import { SERVICE_TYPES, ServiceType } from '../types';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  'engine-oil': Droplet,
  'oil-filter': Filter,
  'air-filter': Wind,
  'cabin-filter': Wind,
  'timing-belt': Clock,
  'other': Package,
};

export default function ServiceSelection() {
  const navigate = useNavigate();
  const { vehicleId } = useParams<{ vehicleId: string }>();

  const handleServiceClick = (serviceType: ServiceType) => {
    navigate(`/vehicles/${vehicleId}/service/${serviceType}/products`);
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
        {(Object.entries(SERVICE_TYPES) as [ServiceType, string][]).map(([type, label]) => {
          const Icon = SERVICE_ICONS[type];
          
          return (
            <Card
              key={type}
              className="cursor-pointer hover:shadow-lg hover:border-[#3B82F6] transition-all active:scale-95"
              onClick={() => handleServiceClick(type)}
            >
              <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#3B82F6]" />
                </div>
                <h3 className="font-medium text-center">{label}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
