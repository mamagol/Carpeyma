import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { PlatePicker } from '../components/PlatePicker';
import { Car, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { ServiceStatus } from '../types';

export default function Dashboard() {
  const { user, vehicles, services, updateUser, addVehicle } = useApp();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 1405,
    plate: '',
    currentKilometers: 0,
  });
  const [plateData, setPlateData] = useState({
    part1: '', // دو رقم
    letter: '', // حرف
    part2: '', // سه رقم
    cityCode: '', // کد شهر
  });

  // Show profile completion if user hasn't set name
  const showProfilePrompt = !user?.firstName;

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

  // Get all services for all vehicles with status
  const allServicesWithStatus = services.map(service => {
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    if (!vehicle) return null;
    
    const status = getServiceStatus(vehicle.currentKilometers, service.nextServiceKilometers);
    const remainingKm = service.nextServiceKilometers - vehicle.currentKilometers;
    
    return {
      ...service,
      vehicle,
      status,
      remainingKm,
    };
  }).filter(Boolean);

  // Sort by status priority (urgent > warning > normal)
  const sortedServices = allServicesWithStatus.sort((a, b) => {
    const statusPriority = { urgent: 0, warning: 1, normal: 2 };
    return statusPriority[a!.status] - statusPriority[b!.status];
  });

  // Get urgent and warning services count
  const urgentCount = allServicesWithStatus.filter(s => s?.status === 'urgent').length;
  const warningCount = allServicesWithStatus.filter(s => s?.status === 'warning').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model) {
      return;
    }

    // ترکیب پلاک
    const fullPlate = `${plateData.part1}${plateData.letter}${plateData.part2}-${plateData.cityCode}`;

    addVehicle({
      ...formData,
      plate: fullPlate.trim() !== '-' ? fullPlate : '',
    });
    setIsSheetOpen(false);
    setFormData({
      brand: '',
      model: '',
      year: 1405,
      plate: '',
      currentKilometers: 0,
    });
    setPlateData({
      part1: '',
      letter: '',
      part2: '',
      cityCode: '',
    });
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Profile completion handled in Profile page
    navigate('/profile');
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl">داشبورد</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.firstName ? `سلام ${user.firstName}!` : 'به سیستم مدیریت خودرو خوش آمدید'}
        </p>
      </div>

      {/* Profile Completion Prompt */}
      {showProfilePrompt && (
        <Card className="border-[#3B82F6] bg-[#3B82F6]/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium">تکمیل پروفایل</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  لطفاً نام و نام خانوادگی خود را در پروفایل تکمیل کنید
                </p>
                <Button
                  onClick={handleCompleteProfile}
                  className="mt-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  size="sm"
                >
                  تکمیل پروفایل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6]">
                {vehicles.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">خودرو</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6]">
                {services.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">سرویس</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Services Alert */}
      {urgentCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive">نیاز به سرویس فوری</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {urgentCount} سرویس نیاز به انجام دارد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Services Alert */}
      {warningCount > 0 && urgentCount === 0 && (
        <Card className="border-[#f59e0b] bg-[#f59e0b]/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-[#f59e0b]">نزدیک به موعد سرویس</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {warningCount} سرویس به زودی نیاز به انجام دارد
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">خودروهای من</h2>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                <Plus className="w-4 h-4 ml-1" />
                افزودن خودرو
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>افزودن خودرو جدید</SheetTitle>
                <SheetDescription>
                  اطلاعات خودرو خود را وارد کنید تا آن را به لیست خودروهای شما اضافه کنید.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pb-4 px-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">برند خودرو</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="مثلاً: پژو، پراید، ..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">مدل خودرو</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="مثلاً: 206، 405، ..."
                    required
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
                  <Label htmlFor="kilometers">کیلومتر فعلی</Label>
                  <Input
                    id="kilometers"
                    type="number"
                    value={formData.currentKilometers}
                    onChange={(e) => setFormData({ ...formData, currentKilometers: parseInt(e.target.value) || 0 })}
                    min="0"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>پلاک خودرو (اختیاری)</Label>
                  <PlatePicker
                    value={plateData}
                    onChange={setPlateData}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  >
                    افزودن خودرو
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    لغو
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">هنوز خودرویی اضافه نکرده‌اید</p>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                    <Plus className="w-4 h-4 ml-1" />
                    افزودن اولین خودرو
                  </Button>
                </SheetTrigger>
              </Sheet>
            </CardContent>
          </Card>
        ) : (
          vehicles.map((vehicle) => {
            const vehicleServices = services.filter(s => s.vehicleId === vehicle.id);
            const nextService = vehicleServices.length > 0
              ? vehicleServices.reduce((prev, current) => {
                  const prevRemaining = prev.nextServiceKilometers - vehicle.currentKilometers;
                  const currentRemaining = current.nextServiceKilometers - vehicle.currentKilometers;
                  return currentRemaining < prevRemaining ? current : prev;
                })
              : null;

            const status = nextService
              ? getServiceStatus(vehicle.currentKilometers, nextService.nextServiceKilometers)
              : null;

            const remainingKm = nextService
              ? nextService.nextServiceKilometers - vehicle.currentKilometers
              : null;

            const progress = nextService
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((vehicle.currentKilometers - nextService.currentKilometers) /
                      (nextService.nextServiceKilometers - nextService.currentKilometers)) *
                      100
                  )
                )
              : 0;

            return (
              <Card
                key={vehicle.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        مدل {vehicle.year}
                      </p>
                    </div>
                    {status && (
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="mr-1">
                          {status === 'urgent'
                            ? 'فوری'
                            : status === 'warning'
                            ? 'هشدار'
                            : 'عادی'}
                        </span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">کیلومتر فعلی</span>
                    <span className="font-medium" dir="ltr">
                      {vehicle.currentKilometers.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  {nextService && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">سرویس بعدی</span>
                        <span
                          className={
                            remainingKm! <= 0
                              ? 'text-destructive font-medium'
                              : remainingKm! <= 1000
                              ? 'text-[#f59e0b] font-medium'
                              : 'text-[#22c55e] font-medium'
                          }
                          dir="ltr"
                        >
                          {remainingKm! > 0
                            ? `${remainingKm!.toLocaleString('fa-IR')} کیلومتر`
                            : 'گذشته از موعد'}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </>
                  )}
                  {!nextService && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      سرویسی ثبت نشده است
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