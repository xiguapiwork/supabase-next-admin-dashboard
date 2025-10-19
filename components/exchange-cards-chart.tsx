'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { ExchangeCardsSituationChart } from './exchange-cards-situation-chart';
import { ExchangeRateChart } from './exchange-rate-chart';

export function ExchangeCardsChart() {
  const [timeRange, setTimeRange] = useState('7');
  const [dataType, setDataType] = useState('cumulative');
  const [displayMode, setDisplayMode] = useState('quantity'); // 数量/积分切换
  const [viewType, setViewType] = useState('situation'); // 积分卡情况/兑换率切换

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {/* 积分卡情况/兑换率切换 */}
          <ToggleGroupCustom
            options={['积分卡情况', '兑换率']}
            value={viewType === 'situation' ? '积分卡情况' : '兑换率'}
            onValueChange={(value) => setViewType(value === '积分卡情况' ? 'situation' : 'rate')}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* 数量/积分切换 */}
          <ToggleGroupCustom
            options={['数量', '积分']}
            value={displayMode === 'quantity' ? '数量' : '积分'}
            onValueChange={(value) => setDisplayMode(value === '数量' ? 'quantity' : 'points')}
          />
          {/* 累计/新增切换 */}
          <ToggleGroupCustom
            options={['累计', '新增']}
            value={dataType === 'cumulative' ? '累计' : '新增'}
            onValueChange={(value) => setDataType(value === '累计' ? 'cumulative' : 'new')}
          />
          {/* 7日/30日切换 */}
          <ToggleGroupCustom
            options={['7日', '30日']}
            value={`${timeRange}日`}
            onValueChange={(value) => setTimeRange(value.replace('日', ''))}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {viewType === 'situation' ? (
          <ExchangeCardsSituationChart
            dataType={dataType}
            timeRange={timeRange}
            displayMode={displayMode}
            onDataTypeChange={setDataType}
            onTimeRangeChange={setTimeRange}
            onDisplayModeChange={setDisplayMode}
          />
        ) : (
          <ExchangeRateChart
            dataType={dataType}
            timeRange={timeRange}
            displayMode={displayMode}
            onDataTypeChange={setDataType}
            onTimeRangeChange={setTimeRange}
            onDisplayModeChange={setDisplayMode}
          />
        )}
      </CardContent>
    </Card>
  );
}