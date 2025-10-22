'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { UsersCountChart } from './users-count-chart';
import { PaymentRateChart } from './payment-rate-chart';

export function UsersOverallSituationChart() {
  const [timeRange, setTimeRange] = useState('7');
  const [dataType, setDataType] = useState('cumulative');
  const [viewType, setViewType] = useState('userCount'); // 'userCount' 或 'paymentRate'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ToggleGroupCustom
            options={['用户数情况', '付费率']}
            value={viewType === 'userCount' ? '用户数情况' : '付费率'}
            onValueChange={(value) => setViewType(value === '用户数情况' ? 'userCount' : 'paymentRate')}
          />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroupCustom
            options={['累计', '新增']}
            value={dataType === 'cumulative' ? '累计' : '新增'}
            onValueChange={(value) => setDataType(value === '累计' ? 'cumulative' : 'new')}
          />
          <ToggleGroupCustom
            options={['7日', '30日']}
            value={`${timeRange}日`}
            onValueChange={(value) => setTimeRange(value.replace('日', ''))}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {viewType === 'paymentRate' ? (
          <PaymentRateChart timeRange={parseInt(timeRange)} dataType={dataType as 'cumulative' | 'new'} />
        ) : (
          <UsersCountChart timeRange={parseInt(timeRange)} dataType={dataType as 'cumulative' | 'new'} />
        )}
      </CardContent>
    </Card>
  );
}