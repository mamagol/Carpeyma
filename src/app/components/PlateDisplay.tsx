import React from 'react';

interface PlateData {
  part1: string;
  letter: string;
  part2: string;
  cityCode: string;
}

interface PlateDisplayProps {
  plate: string; // format: "12الف345-11"
}

// پلاک‌های ویژه
const SPECIAL_PLATES = [
  { label: 'معلولین', value: 'معلولین', icon: '♿' },
  { label: 'تشریفات', value: 'تشریفات', icon: '⭐' },
  { label: 'دیپلمات', value: 'دیپلمات', icon: '🎖️' },
];

export function PlateDisplay({ plate }: PlateDisplayProps) {
  // Parse the plate string into parts
  const parsePlate = (plateStr: string): PlateData => {
    if (!plateStr || !plateStr.includes('-')) {
      return { part1: '', letter: '', part2: '', cityCode: '' };
    }

    const parts = plateStr.split('-');
    if (parts.length !== 2) {
      return { part1: '', letter: '', part2: '', cityCode: '' };
    }

    const firstPart = parts[0];
    const cityCode = parts[1];

    // Extract: 2 digits + letter + 3 digits
    const part1Match = firstPart.match(/^(\d{2})/);
    const letterMatch = firstPart.match(/[آ-ی♿⭐🎖️]/u);
    const part2Match = firstPart.match(/(\d{3})$/);

    return {
      part1: part1Match ? part1Match[1] : '',
      letter: letterMatch ? letterMatch[0] : '',
      part2: part2Match ? part2Match[1] : '',
      cityCode: cityCode,
    };
  };

  const value = parsePlate(plate);

  // Helper function to get display for letter (icon if special, text otherwise)
  const getLetterDisplay = (letter: string) => {
    const specialPlate = SPECIAL_PLATES.find(p => p.value === letter);
    return specialPlate ? specialPlate.icon : (letter || '');
  };

  return (
    <div className="relative mx-auto w-fit flex-shrink-0">
      {/* کادر اصلی پلاک */}
      <div className="flex items-stretch gap-0 bg-white border-2 border-[#1a1a1a] rounded-lg overflow-hidden shadow-md" dir="ltr">
        
        {/* بخش سفید (اعداد و حرف) - از چپ به راست */}
        <div className="flex items-center gap-1 px-1.5 py-1.5 bg-white">
          {/* دو رقم */}
          <div className="w-8 h-8 text-center flex items-center justify-center text-lg font-black bg-transparent text-[#1a1a1a] border-2 border-border rounded-md">
            {value.part1 || ''}
          </div>

          {/* حرف */}
          <div className="w-8 h-8 text-center flex items-center justify-center text-lg font-black bg-gradient-to-b from-[#3B82F6]/10 to-[#3B82F6]/5 text-[#1a1a1a] border-2 border-[#3B82F6] rounded-md">
            {getLetterDisplay(value.letter)}
          </div>

          {/* سه رقم */}
          <div className="w-12 h-8 text-center flex items-center justify-center text-lg font-black bg-transparent text-[#1a1a1a] border-2 border-border rounded-md">
            {value.part2 || ''}
          </div>
        </div>

        {/* جداکننده عمودی */}
        <div className="w-0.5 bg-[#1a1a1a]" />
        
        {/* بخش آبی سمت راست (ایران + کد شهر) */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0055aa] to-[#003d7a] px-1.5 py-1.5 gap-1 min-w-[40px]">
          {/* پرچم ایران */}
          <div className="text-base leading-none">🇮🇷</div>
          
          {/* کد شهر */}
          <div className="w-7 h-6 text-center flex items-center justify-center text-sm font-black bg-white text-[#1a1a1a] border border-white rounded">
            {value.cityCode || ''}
          </div>
        </div>
      </div>
    </div>
  );
}