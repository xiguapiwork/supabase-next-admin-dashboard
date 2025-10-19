'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { UsageCountDataChart } from './usage-count-data-chart';
import { UsageSuccessRateChart } from './usage-success-rate-chart';

export function UsageCountChart() {
  const [timeRange, setTimeRange] = useState('7');
  const [dataType, setDataType] = useState('cumulative');
  const [viewType, setViewType] = useState('usage'); // 'usage' or 'rate'

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ToggleGroupCustom
            options={['使用次数', '成功率']}
            value={viewType === 'usage' ? '使用次数' : '成功率'}
            onValueChange={(value) => setViewType(value === '使用次数' ? 'usage' : 'rate')}
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
      <CardContent className="pt-4">
        {viewType === 'usage' ? (
          <UsageCountDataChart dataType={dataType} timeRange={timeRange} />
        ) : (
          <UsageSuccessRateChart dataType={dataType} timeRange={timeRange} />
        )}
      </CardContent>
    </Card>
  );
}