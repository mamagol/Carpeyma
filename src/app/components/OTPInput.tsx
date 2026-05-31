import React, { useRef, useEffect, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from './ui/utils';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  // Check if OTP is complete
  useEffect(() => {
    const otpString = value.join('');
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    // Only accept digits
    const digit = inputValue.replace(/\D/g, '');
    
    if (digit.length === 0) {
      // Clear the current field
      const newValue = [...value];
      newValue[index] = '';
      onChange(newValue);
      return;
    }

    if (digit.length === 1) {
      // Single digit entered
      const newValue = [...value];
      newValue[index] = digit;
      onChange(newValue);

      // Auto-advance to next field
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const currentValue = value[index];

    // Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (currentValue) {
        // Clear current field
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      } else if (index > 0) {
        // Move to previous field and clear it
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Left arrow - move to previous field
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    // Right arrow - move to next field
    else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    
    // Home - move to first field
    else if (e.key === 'Home') {
      e.preventDefault();
      inputRefs.current[0]?.focus();
    }
    
    // End - move to last field
    else if (e.key === 'End') {
      e.preventDefault();
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pasteData = e.clipboardData.getData('text/plain');
    const digits = pasteData.replace(/\D/g, '').slice(0, length);
    
    if (digits.length > 0) {
      const newValue = [...value];
      
      // Fill fields with pasted digits
      for (let i = 0; i < length; i++) {
        newValue[i] = digits[i] || '';
      }
      
      onChange(newValue);
      
      // Focus the next empty field or the last field
      const nextEmptyIndex = newValue.findIndex(v => !v);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handleClick = (index: number) => {
    // When clicking on a field, select its content
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex justify-center gap-2', className)} dir="ltr">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          onClick={() => handleClick(index)}
          disabled={disabled}
          className={cn(
            // Base styles
            'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold',
            'rounded-lg border-2 transition-all duration-200',
            'outline-none focus:outline-none',
            
            // Default state
            'border-input bg-background text-foreground',
            
            // Focus state
            focusedIndex === index && !error && !disabled && [
              'border-[#3B82F6] ring-4 ring-[#3B82F6]/20',
              'shadow-lg shadow-[#3B82F6]/10',
            ],
            
            // Error state
            error && !disabled && [
              'border-red-500 bg-red-50 dark:bg-red-950/20',
              focusedIndex === index && 'ring-4 ring-red-500/20',
            ],
            
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed bg-muted',
            
            // Filled state (has value)
            value[index] && !error && !disabled && focusedIndex !== index && [
              'border-[#3B82F6]/50 bg-[#3B82F6]/5',
            ],
            
            // Hover state (when not focused or disabled)
            !disabled && focusedIndex !== index && 'hover:border-[#3B82F6]/50',
          )}
          aria-label={`رقم ${index + 1} از کد تایید`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      ))}
    </div>
  );
}