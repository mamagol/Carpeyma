import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LogOut, Edit, Check } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUser } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (confirm('آیا از خروج اطمینان دارید؟')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl">پروفایل</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت اطلاعات حساب کاربری
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">اطلاعات شخصی</CardTitle>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 ml-1" />
                ویرایش
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">نام</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="نام خود را وارد کنید"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                >
                  <Check className="w-4 h-4 ml-1" />
                  ذخیره
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                    });
                  }}
                >
                  لغو
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">نام و نام خانوادگی</p>
                <p className="font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'تکمیل نشده'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">شماره موبایل</p>
                <p className="font-medium" dir="ltr">
                  {user?.phoneNumber}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">تنظیمات حساب</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4 ml-1" />
            خروج از حساب کاربری
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>کارپیما</p>
            <p className="mt-1">نسخه ۱.۰.۰</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}