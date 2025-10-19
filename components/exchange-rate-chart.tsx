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

// Define mock data directly in the file
const mockDataCumulative = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const totalCards = 1000 + i * 30 + Math.floor(Math.random() * 50);
  const exchangedCards = 200 + i * 10 + Math.floor(Math.random() * 20);
  const totalPoints = totalCards * 100;
  const exchangedPoints = exchangedCards * 100;
  
  return {
    date: date.toISOString().split('T')[0],
    cardsExchangeRate: totalCards > 0 ? (exchangedCards / totalCards) * 100 : 0,
    pointsExchangeRate: totalPoints > 0 ? (exchangedPoints / totalPoints) * 100 : 0,
  };
}).reverse();

const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const cards = 30 + Math.floor(Math.random() * 20);
  const exchanged = 8 + Math.floor(Math.random() * 10);
  const totalPoints = cards * 100;
  const exchangedPoints = exchanged * 100;
  
  return {
    date: date.toISOString().split('T')[0],
    cardsExchangeRate: cards > 0 ? (exchanged / cards) * 100 : 0,
    pointsExchangeRate: totalPoints > 0 ? (exchangedPoints / totalPoints) * 100 : 0,
  };
}).reverse();

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
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg w-[200px]">
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
  const data = (dataType === 'cumulative' ? mockDataCumulative : mockDataNew).slice(
    -parseInt(timeRange)
  );

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