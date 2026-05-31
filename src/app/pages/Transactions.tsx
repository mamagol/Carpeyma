import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Receipt } from 'lucide-react';

export default function Transactions() {
  const { transactions, vehicles } = useApp();

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalAmount = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'نامشخص';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl">سابقه خدمات</h1>
        
      </div>

      {/* Transactions List */}
      {sortedTransactions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">هنوز سابقه‌ای ثبت نشده است</h3>
            <p className="text-sm text-muted-foreground">
              با افزودن سرویس، سوابق اینجا نمایش داده می‌شوند
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {transaction.description}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getVehicleName(transaction.vehicleId)}
                    </p>
                  </div>
                  <Badge
                    className={
                      transaction.status === 'paid'
                        ? 'bg-[#10b981] text-white'
                        : 'bg-[#f59e0b] text-white'
                    }
                  >
                    {transaction.status === 'paid' ? 'انجام شده' : 'در انتظار'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
