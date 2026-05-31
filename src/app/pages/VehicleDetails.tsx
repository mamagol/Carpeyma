import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Textarea } from '../components/ui/textarea';
import { PlatePicker } from '../components/PlatePicker';
import { PlateDisplay } from '../components/PlateDisplay';
import { PersianDatePicker } from '../components/PersianDatePicker';
import { ArrowRight, Edit2, Plus, Trash2, AlertCircle, CheckCircle, Droplets, Filter, Wind, AirVent, Cog, Wrench, Info, ChevronRight } from 'lucide-react';
import { ServiceStatus, SERVICE_TYPES, ServiceType } from '../types';
import { PRODUCTS, Product } from '../data/products';

type AddServiceStep = 'select-service' | 'select-product' | 'submit';

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, services, updateVehicle, getVehicleServices, deleteService, addService, addTransaction } = useApp();
  
  const vehicle = vehicles.find(v => v.id === id);
  const vehicleServices = getVehicleServices(id || '');

  const [isEditKmOpen, setIsEditKmOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [addServiceStep, setAddServiceStep] = useState<AddServiceStep>('select-service');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('engine-oil');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || 1405,
    currentKilometers: vehicle?.currentKilometers || 0,
  });

  const [plateData, setPlateData] = useState({
    part1: '',
    letter: '',
    part2: '',
    cityCode: '',
  });

  const [serviceFormData, setServiceFormData] = useState({
    currentKilometers: vehicle?.currentKilometers || 0,
    nextServiceKilometers: (vehicle?.currentKilometers || 0) + 5000,
    serviceDate: new Date(),
    notes: '',
    cost: 0,
  });

  if (!vehicle) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>خودرو یافت نشد</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              بازگشت به داشبورد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getServiceStatus = (currentKm: number, nextServiceKm: number): ServiceStatus => {
    const remaining = nextServiceKm - currentKm;
    if (remaining <= 0) return 'urgent';
    if (remaining <= 1000) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-[#f59e0b] text-white';
      case 'normal':
        return 'bg-[#22c55e] text-white';
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleUpdateKilometers = () => {
    if (formData.currentKilometers < vehicle.currentKilometers) {
      return;
    }
    
    const plate = plateData.part1 && plateData.part2 && plateData.cityCode
      ? `${plateData.part1}${plateData.letter}${plateData.part2}-${plateData.cityCode}`
      : vehicle.plate;
    
    updateVehicle(vehicle.id, { 
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      currentKilometers: formData.currentKilometers,
      plate: plate
    });
    setIsEditKmOpen(false);
  };
  
  const handleOpenEditDialog = () => {
    // Set form data
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      currentKilometers: vehicle.currentKilometers,
    });
    
    // Parse plate if exists
    if (vehicle.plate) {
      const parts = vehicle.plate.split('-');
      if (parts.length === 2) {
        const firstPart = parts[0];
        const cityCode = parts[1];
        
        // Extract: 2 digits + letter + 3 digits
        const part1Match = firstPart.match(/^(\d{2})/);
        const letterMatch = firstPart.match(/[آ-ی]/);
        const part2Match = firstPart.match(/(\d{3})$/);
        
        setPlateData({
          part1: part1Match ? part1Match[1] : '',
          letter: letterMatch ? letterMatch[0] : '',
          part2: part2Match ? part2Match[1] : '',
          cityCode: cityCode,
        });
      }
    } else {
      setPlateData({
        part1: '',
        letter: '',
        part2: '',
        cityCode: '',
      });
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('آیا از حذف این سرویس اطمینان دارید؟')) {
      deleteService(serviceId);
    }
  };

  const handleOpenAddService = () => {
    setAddServiceStep('select-service');
    setSelectedProduct(null);
    setServiceFormData({
      currentKilometers: vehicle.currentKilometers,
      nextServiceKilometers: vehicle.currentKilometers + 5000,
      serviceDate: new Date(),
      notes: '',
      cost: 0,
    });
    setSelectedServiceType('engine-oil');
    setIsAddServiceOpen(true);
  };

  const handleSelectService = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType);
    setAddServiceStep('select-product');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setServiceFormData({
      ...serviceFormData,
      cost: product.price,
    });
    setAddServiceStep('submit');
  };

  const handleBackInAddService = () => {
    if (addServiceStep === 'select-product') {
      setAddServiceStep('select-service');
    } else if (addServiceStep === 'submit') {
      setAddServiceStep('select-product');
    }
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();

    addService({
      vehicleId: vehicle.id,
      type: selectedServiceType,
      currentKilometers: serviceFormData.currentKilometers,
      nextServiceKilometers: serviceFormData.nextServiceKilometers,
      serviceDate: new Date(serviceFormData.serviceDate),
      notes: serviceFormData.notes,
      cost: serviceFormData.cost,
    });

    if (serviceFormData.cost > 0) {
      addTransaction({
        vehicleId: vehicle.id,
        amount: serviceFormData.cost,
        date: new Date(serviceFormData.serviceDate),
        description: `${SERVICE_TYPES[selectedServiceType]} - ${vehicle.brand} ${vehicle.model}`,
        status: 'paid',
      });
    }

    setIsAddServiceOpen(false);
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'engine-oil':
        return <Droplets className="w-6 h-6" />;
      case 'oil-filter':
        return <Filter className="w-6 h-6" />;
      case 'air-filter':
        return <Wind className="w-6 h-6" />;
      case 'cabin-filter':
        return <AirVent className="w-6 h-6" />;
      case 'timing-belt':
        return <Cog className="w-6 h-6" />;
      case 'other':
        return <Wrench className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدل {vehicle.year}
          </p>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Plate Display */}
            {vehicle.plate && (
              <div className="flex justify-center">
                <PlateDisplay plate={vehicle.plate} />
              </div>
            )}

            {/* Current Kilometers */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">کیلومتر فعلی</span>
              <span className="text-lg font-medium" dir="ltr">
                {vehicle.currentKilometers.toLocaleString('fa-IR')}
              </span>
            </div>

            {/* دکمه‌های افزودن سرویس و ویرایش مشخصات */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                onClick={handleOpenAddService}
              >
                <Plus className="w-4 h-4 ml-1" />
                سرویس جدید
              </Button>

              <Sheet open={isEditKmOpen} onOpenChange={setIsEditKmOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleOpenEditDialog}
                  >
                    <Edit2 className="w-4 h-4 ml-1" />
                    ویرایش
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>ویرایش اطلاعات خودرو</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 pb-4 px-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">برند</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="مثلاً: پژو، پراید، ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">مدل</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="مثلاً: 206، 405، ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">سال تولید</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="1300"
                        max="1410"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentKm">کیلومتر فعلی</Label>
                      <Input
                        id="currentKm"
                        type="number"
                        value={formData.currentKilometers}
                        onChange={(e) => setFormData({ ...formData, currentKilometers: parseInt(e.target.value) || 0 })}
                        min="0"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>پلاک خودرو</Label>
                      <PlatePicker
                        value={plateData}
                        onChange={setPlateData}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleUpdateKilometers}
                        className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                      >
                        ذخیره تغییرات
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditKmOpen(false)}
                      >
                        لغو
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Service Sheet */}
      <Sheet open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              {(addServiceStep === 'select-product' || addServiceStep === 'submit') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackInAddService}
                  type="button"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1">
                <SheetTitle>
                  {addServiceStep === 'select-service' && 'انتخاب نوع سرویس'}
                  {addServiceStep === 'select-product' && 'انتخاب محصول'}
                  {addServiceStep === 'submit' && 'ثبت سرویس'}
                </SheetTitle>
                <SheetDescription>
                  {addServiceStep === 'select-service' && 'نوع سرویس مورد نظر را انتخاب کنید'}
                  {addServiceStep === 'select-product' && 'محصول مورد نیاز را انتخاب کنید'}
                  {addServiceStep === 'submit' && 'اطلاعات سرویس را تکمیل کنید'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="pb-4 px-4">
            {/* Step 1: Select Service Type */}
            {addServiceStep === 'select-service' && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectService(key as ServiceType)}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-border hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors aspect-square"
                  >
                    <div className="text-[#3B82F6] mb-2">
                      {getServiceIcon(key as ServiceType)}
                    </div>
                    <span className="text-sm text-center">{value}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Select Product */}
            {addServiceStep === 'select-product' && (
              <div className="space-y-3 mt-4">
                {PRODUCTS[selectedServiceType].map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-[#3B82F6] transition-colors"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                              )}
                            </div>
                            <button
                              className="text-[#3B82F6] flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Show product details modal
                              }}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#3B82F6]">
                              {product.price.toLocaleString('fa-IR')} تومان
                            </span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground rotate-180" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 3: Submit Form */}
            {addServiceStep === 'submit' && (
              <form onSubmit={handleSubmitService} className="space-y-4 mt-4">
                {/* Selected Product Display */}
                {selectedProduct && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-background">
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{selectedProduct.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{SERVICE_TYPES[selectedServiceType]}</p>
                          <p className="text-sm font-medium text-[#3B82F6] mt-1">
                            {selectedProduct.price.toLocaleString('fa-IR')} تومان
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="serviceCurrentKm">کیلومتر انجام سرویس</Label>
                  <Input
                    id="serviceCurrentKm"
                    type="number"
                    value={serviceFormData.currentKilometers}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, currentKilometers: parseInt(e.target.value) || 0 })}
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
                    value={serviceFormData.nextServiceKilometers}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, nextServiceKilometers: parseInt(e.target.value) || 0 })}
                    min={serviceFormData.currentKilometers}
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDate">تاریخ انجام سرویس</Label>
                  <PersianDatePicker
                    value={serviceFormData.serviceDate}
                    onChange={(date) => setServiceFormData({ ...serviceFormData, serviceDate: date })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">هزینه (تومان)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={serviceFormData.cost}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, cost: parseInt(e.target.value) || 0 })}
                    min="0"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">توضیحات (اختیاری)</Label>
                  <Textarea
                    id="notes"
                    value={serviceFormData.notes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, notes: e.target.value })}
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
                    onClick={() => setIsAddServiceOpen(false)}
                  >
                    لغو
                  </Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Services List */}
      <div className="space-y-4">
        <h2 className="text-xl">تاریخچه سرویس‌ها</h2>
        
        {vehicleServices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>هنوز سرویسی ثبت نشده است</p>
            </CardContent>
          </Card>
        ) : (
          vehicleServices.map((service) => {
            const status = getServiceStatus(vehicle.currentKilometers, service.nextServiceKilometers);
            const remainingKm = service.nextServiceKilometers - vehicle.currentKilometers;
            const progress = Math.min(
              100,
              Math.max(
                0,
                ((vehicle.currentKilometers - service.currentKilometers) /
                  (service.nextServiceKilometers - service.currentKilometers)) *
                  100
              )
            );

            return (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {SERVICE_TYPES[service.type]}
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)}
                          <span className="mr-1">
                            {status === 'urgent'
                              ? 'نیاز به سرویس'
                              : status === 'warning'
                              ? 'نزدیک به سرویس'
                              : 'عادی'}
                          </span>
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(service.serviceDate).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">کیلومتر انجام شده</span>
                    <span dir="ltr">{service.currentKilometers.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">سرویس بعدی</span>
                    <span dir="ltr">{service.nextServiceKilometers.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">باقی‌مانده</span>
                    <span
                      className={
                        remainingKm <= 0
                          ? 'text-destructive font-medium'
                          : remainingKm <= 1000
                          ? 'text-[#f59e0b] font-medium'
                          : 'text-[#22c55e] font-medium'
                      }
                      dir="ltr"
                    >
                      {remainingKm > 0
                        ? `${remainingKm.toLocaleString('fa-IR')} کیلومتر`
                        : 'گذشته از موعد'}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {service.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">{service.notes}</p>
                    </div>
                  )}
                  {service.cost > 0 && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">هزینه</span>
                      <span className="font-medium text-[#3B82F6]">
                        {service.cost.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}