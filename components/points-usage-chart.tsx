'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { PointsUsageDataChart } from './points-usage-data-chart';
import { PointsUsageRateOnlyChart } from './points-usage-rate-only-chart';

export function PointsUsageChart() {
  const [timeRange, setTimeRange] = useState('7');
  const [dataType, setDataType] = useState('cumulative');
  const [viewType, setViewType] = useState('usage'); // 'usage' or 'rate'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ToggleGroupCustom
            options={['积分使用情况', '使用率']}
            value={viewType === 'usage' ? '积分使用情况' : '使用率'}
            onValueChange={(value) => setViewType(value === '积分使用情况' ? 'usage' : 'rate')}
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
          <PointsUsageDataChart dataType={dataType} timeRange={timeRange} />
        ) : (
          <PointsUsageRateOnlyChart dataType={dataType} timeRange={timeRange} />
        )}
      </CardContent>
    </Card>
  );
}