import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PlatePicker } from '../components/PlatePicker';
import { ArrowRight } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const { addVehicle } = useApp();
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 1405,
    currentKilometers: 0,
  });

  const [plateData, setPlateData] = useState({
    part1: '',
    letter: '',
    part2: '',
    cityCode: '',
  });

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

    navigate('/');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl">افزودن خودرو جدید</h1>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <PlatePicker
                value={plateData}
                onChange={setPlateData}
                label="پلاک خودرو (اختیاری)"
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
                onClick={() => navigate('/')}
              >
                لغو
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
