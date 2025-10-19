'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { FunctionStatusDataChart } from './function-status-data-chart';
import { FunctionStatusRateChart } from './function-status-rate-chart';
import { FunctionStatusUserChart } from './function-status-user-chart';

export function FunctionStatusChart() {
  const [timeRange, setTimeRange] = useState('7');
  const [dataType, setDataType] = useState('cumulative');
  const [viewType, setViewType] = useState('usage'); // 'usage', 'users', or 'rate'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ToggleGroupCustom
            options={['次数', '人数', '使用率']}
            value={viewType === 'usage' ? '次数' : viewType === 'users' ? '人数' : '使用率'}
            onValueChange={(value) => {
              if (value === '次数') setViewType('usage');
              else if (value === '人数') setViewType('users');
              else setViewType('rate');
            }}
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
        {viewType === 'usage' ? (
          <FunctionStatusDataChart dataType={dataType} timeRange={timeRange} />
        ) : viewType === 'users' ? (
          <FunctionStatusUserChart dataType={dataType} timeRange={timeRange} />
        ) : (
          <FunctionStatusRateChart dataType={dataType} timeRange={timeRange} />
        )}
      </CardContent>
    </Card>
  );
}