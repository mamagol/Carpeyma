import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Droplets } from 'lucide-react';
import { OTPInput } from '../components/OTPInput';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, verifyOTP } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 11) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error } = await login(phoneNumber);

    if (error) {
      setErrorMessage('خطا در ارسال کد. لطفاً دوباره تلاش کنید.');
      setIsLoading(false);
    } else {
      setIsOtpSent(true);
      setTimer(120); // 2 minutes
      setIsLoading(false);
    }
  };

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    setOtpError(false);
    setErrorMessage('');
  };

  const handleOtpComplete = (otpString: string) => {
    if (otpString.length === 4) {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join('').length !== 4) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const otpString = otp.join('');
    const { error } = await verifyOTP(phoneNumber, otpString);

    if (error) {
      setOtpError(true);
      setErrorMessage('کد تایید اشتباه است. لطفاً دوباره تلاش کنید.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      navigate('/');
    }
  };

  const handleResendOtp = () => {
    if (timer === 0) {
      handleSendOtp();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3B82F6]/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center">
            <Droplets className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">کارپیما</CardTitle>
            <CardDescription className="mt-2">
              {isOtpSent ? 'کد تایید را وارد کنید' : 'ورود یا ثبت‌نام'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isOtpSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="text-center text-lg tracking-widest"
                  dir="ltr"
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-red-500 text-center">{errorMessage}</p>
              )}
              <Button
                onClick={handleSendOtp}
                disabled={isLoading || phoneNumber.length !== 11}
                className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                {isLoading ? 'در حال ارسال...' : 'دریافت کد تایید'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-3 bg-[#3B82F6]/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  کد تایید به شماره{' '}
                  <span className="font-medium text-foreground" dir="ltr">
                    {phoneNumber}
                  </span>
                  {' '}ارسال شد
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-center block">کد تایید ۴ رقمی را وارد کنید</Label>
                <OTPInput
                  value={otp}
                  onChange={handleOtpChange}
                  onComplete={handleOtpComplete}
                  error={otpError}
                  disabled={isLoading}
                  autoFocus={true}
                />
                {errorMessage && (
                  <p className="text-sm text-red-500 text-center mt-2">{errorMessage}</p>
                )}
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join('').length !== 4}
                className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                {isLoading ? 'در حال تایید...' : 'تایید و ورود'}
              </Button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ارسال مجدد کد تا{' '}
                    <span className="font-medium" dir="ltr">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleResendOtp}
                    className="text-[#3B82F6] hover:text-[#3B82F6]/90"
                  >
                    ارسال مجدد کد
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp(['', '', '', '']);
                  setOtpError(false);
                  setErrorMessage('');
                  setTimer(0);
                }}
                className="w-full"
              >
                تغییر شماره موبایل
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}