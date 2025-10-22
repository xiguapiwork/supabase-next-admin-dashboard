'use client';

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { useExchangeCardsData } from '@/hooks/use-exchange-cards-data';

const chartConfig = {
  cardsExchangeRate: {
    label: '兑换率',
    color: 'black',
  },
  pointsExchangeRate: {
    label: '积分兑换率',
    color: 'black',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      cardsExchangeRate: number;
      pointsExchangeRate: number;
      date: string;
    };
  }>;
  label?: string;
  dataType: string;
  displayMode: string;
}

const CustomTooltip = ({ active, payload, label, dataType, displayMode }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // 根据displayMode决定显示数量还是积分的兑换率
    const isPointsMode = displayMode === 'points';
    const exchangeRate = isPointsMode ? data.pointsExchangeRate : data.cardsExchangeRate;

    // 根据dataType和displayMode显示不同的标题
    const isCumulative = dataType === 'cumulative';
    let rateLabel;
    
    if (isPointsMode) {
      rateLabel = isCumulative ? '积分兑换率' : '新增积分兑换率';
    } else {
      rateLabel = isCumulative ? '兑换率' : '新增兑换率';
    }

    return (
      <div className="bg-popover text-popover-foreground p-4 border rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{rateLabel}</span>
          <span>{exchangeRate.toFixed(2)}%</span>
        </div>
      </div>
    );
  }

  return null;
};

interface ExchangeRateChartProps {
  dataType: string;
  timeRange: string;
  displayMode: string;
  onDataTypeChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  onDisplayModeChange: (value: string) => void;
}

export function ExchangeRateChart({ 
  dataType, 
  timeRange, 
  displayMode 
}: ExchangeRateChartProps) {
  const { data: rawData, isLoading, error } = useExchangeCardsData(
    parseInt(timeRange), 
    dataType as 'cumulative' | 'new'
  );

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-destructive">加载数据失败</div>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  const data = rawData;

  // 根据displayMode决定显示的数据键
  const rateDataKey = displayMode === 'points' ? 'pointsExchangeRate' : 'cardsExchangeRate';

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            });
          }}

          tick={({ x, y, payload }) => {
            const date = new Date(payload.value);
            const weekday = date.toLocaleDateString('zh-CN', {
              weekday: 'short',
            });
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="middle"
                  fill="#666"
                  fontSize={12}
                >
                  {new Date(payload.value).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
                <text
                  x={0}
                  y={0}
                  dy={32}
                  textAnchor="middle"
                  fill="#666"
                  fontSize={12}
                >
                  {weekday}
                </text>
              </g>
            );
          }}
          height={50} // Increase height to accommodate two lines
        />
        <YAxis 
          strokeDasharray="3 3" 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={60}
          tick={{ fontSize: 12, fill: '#666' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip dataType={dataType} displayMode={displayMode} />} />
        <Line
          dataKey={rateDataKey}
          type="monotone"
          stroke={displayMode === 'points' ? chartConfig.pointsExchangeRate.color : chartConfig.cardsExchangeRate.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}