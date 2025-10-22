'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { ExchangeCardsSituationChart } from './exchange-cards-situation-chart';
import { ExchangeRateChart } from './exchange-rate-chart';
import { useCreateTestData } from '@/hooks/use-create-test-data';

export function ExchangeCardsChart() {
  const [timeRange, setTimeRange] = useState<number>(7);
  const [dataType, setDataType] = useState<'cumulative' | 'new'>('cumulative');
  const [displayMode, setDisplayMode] = useState<'quantity' | 'points'>('quantity'); // 数量/积分切换
  const [viewType, setViewType] = useState<'situation' | 'rate'>('situation'); // 积分卡情况/兑换率切换
  
  const createTestData = useCreateTestData();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* 积分卡情况/兑换率切换 */}
          <ToggleGroupCustom
            options={['积分卡情况', '兑换率']}
            value={viewType === 'situation' ? '积分卡情况' : '兑换率'}
            onValueChange={(value) => setViewType(value === '积分卡情况' ? 'situation' : 'rate')}
          />
          {/* 测试数据按钮 */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createTestData.mutate()}
            disabled={createTestData.isPending}
          >
            {createTestData.isPending ? '创建中...' : '创建测试数据'}
          </Button>
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
            onValueChange={(value) => setTimeRange(parseInt(value.replace('日', '')))}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {viewType === 'situation' ? (
          <ExchangeCardsSituationChart
            dataType={dataType}
            timeRange={timeRange.toString()}
            displayMode={displayMode}
            onDataTypeChange={(value) => setDataType(value as 'cumulative' | 'new')}
            onTimeRangeChange={(value) => setTimeRange(parseInt(value))}
            onDisplayModeChange={(value) => setDisplayMode(value as 'quantity' | 'points')}
          />
        ) : (
          <ExchangeRateChart
            dataType={dataType}
            timeRange={timeRange.toString()}
            displayMode={displayMode}
            onDataTypeChange={(value) => setDataType(value as 'cumulative' | 'new')}
            onTimeRangeChange={(value) => setTimeRange(parseInt(value))}
            onDisplayModeChange={(value) => setDisplayMode(value as 'quantity' | 'points')}
          />
        )}
      </CardContent>
    </Card>
  );
}