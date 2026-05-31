import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { cn } from './ui/utils';

interface PersianDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Format date using browser's built-in Persian formatter
  const formatPersianDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    if (value) {
      setInputValue(formatPersianDate(value));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const quickDates = [
    { label: 'امروز', offset: 0 },
    { label: 'دیروز', offset: -1 },
    { label: '۲ روز پیش', offset: -2 },
    { label: '۳ روز پیش', offset: -3 },
    { label: 'هفته پیش', offset: -7 },
    { label: '۲ هفته پیش', offset: -14 },
    { label: 'ماه پیش', offset: -30 },
    { label: '۲ ماه پیش', offset: -60 },
  ];

  const handleQuickDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    onChange(date);
    setInputValue(formatPersianDate(date));
    setIsOpen(false);
  };

  // Parse Persian date string and convert to Gregorian
  const parsePersianDate = (persianStr: string): Date | null => {
    try {
      // Normalize Persian/Arabic numerals to English
      const normalized = persianStr
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
        .replace(/[٠-٩]/g, (d) => '٠٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .trim();

      // Try to parse as YYYY/MM/DD
      const parts = normalized.split('/').map(p => parseInt(p.trim()));
      
      if (parts.length === 3 && parts.every(p => !isNaN(p))) {
        const [jYear, jMonth, jDay] = parts;
        
        // Basic validation
        if (jYear < 1300 || jYear > 1500 || jMonth < 1 || jMonth > 12 || jDay < 1 || jDay > 31) {
          return null;
        }

        // Simple Persian to Gregorian conversion
        // Persian calendar starts on March 21 (roughly)
        const gYear = jYear + 621;
        
        // Days in each Persian month (first 6 months have 31 days, next 5 have 30, last has 29/30)
        const monthDays = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
        
        // Start from March 21 (Nowruz - Persian New Year)
        const baseDate = new Date(gYear, 2, 21); // March is month 2 (0-indexed)
        const daysToAdd = monthDays[jMonth - 1] + (jDay - 1);
        
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        return baseDate;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const handleApply = () => {
    const gregorianDate = parsePersianDate(inputValue);
    if (gregorianDate && !isNaN(gregorianDate.getTime())) {
      onChange(gregorianDate);
      setIsOpen(false);
    } else {
      alert('تاریخ وارد شده معتبر نیست. لطفاً به فرمت ۱۴۰۳/۱۲/۰۶ وارد کنید.');
    }
  };

  const formattedDate = value ? formatPersianDate(value) : placeholder;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-right font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="ml-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle>انتخاب تاریخ</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 pt-6 pb-4 px-4" dir="rtl">
          <div className="space-y-3">
            <label className="text-sm font-medium">تاریخ شمسی</label>
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="۱۴۰۳/۱۲/۰۶"
              className="text-center text-lg h-12"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground text-center">
              فرمت: سال/ماه/روز (مثال: ۱۴۰۳/۱۲/۰۶)
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">انتخاب سریع</label>
            <div className="grid grid-cols-2 gap-2">
              {quickDates.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-sm h-10"
                  onClick={() => handleQuickDate(item.offset)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setIsOpen(false)}
            >
              لغو
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              onClick={handleApply}
            >
              تأیید
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}