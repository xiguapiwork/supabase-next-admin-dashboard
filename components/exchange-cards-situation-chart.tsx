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
  return {
    date: date.toISOString().split('T')[0],
    totalCards: 1000 + i * 30 + Math.floor(Math.random() * 50),
    exchangedCards: 200 + i * 10 + Math.floor(Math.random() * 20),
    totalPoints: (1000 + i * 30 + Math.floor(Math.random() * 50)) * 100, // 积分数量 = 卡数量 * 100
    exchangedPoints: (200 + i * 10 + Math.floor(Math.random() * 20)) * 100, // 兑换积分 = 兑换卡数 * 100
  };
}).reverse();

const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const cards = 30 + Math.floor(Math.random() * 20);
  const exchanged = 8 + Math.floor(Math.random() * 10);
  return {
    date: date.toISOString().split('T')[0],
    totalCards: cards,
    exchangedCards: exchanged,
    totalPoints: cards * 100, // 积分数量 = 卡数量 * 100
    exchangedPoints: exchanged * 100, // 兑换积分 = 兑换卡数 * 100
  };
}).reverse();

const chartConfig = {
  totalCards: {
    label: '总卡片数',
    color: 'hsl(var(--foreground))',
  },
  exchangedCards: {
    label: '已兑换卡片数',
    color: 'hsl(var(--muted-foreground))',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      totalCards: number;
      exchangedCards: number;
      totalPoints: number;
      exchangedPoints: number;
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
    
    // 根据displayMode决定显示数量还是积分
    const isPointsMode = displayMode === 'points';
    const totalValue = isPointsMode ? data.totalPoints : data.totalCards;
    const exchangedValue = isPointsMode ? data.exchangedPoints : data.exchangedCards;

    // 根据dataType和displayMode显示不同的标题
    const isCumulative = dataType === 'cumulative';
    let totalLabel, exchangedLabel;
    
    if (isPointsMode) {
      totalLabel = isCumulative ? '总积分数量' : '新增积分数量';
      exchangedLabel = isCumulative ? '总积分兑换量' : '新增积分兑换量';
    } else {
      totalLabel = isCumulative ? '总积分卡数量' : '新增卡片数量';
      exchangedLabel = isCumulative ? '总积分卡兑换量' : '新增兑换数量';
    }

    return (
      <div className="bg-popover text-popover-foreground p-4 border rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{totalLabel}</span>
          <span>{totalValue}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{exchangedLabel}</span>
          <span>{exchangedValue}</span>
        </div>
      </div>
    );
  }

  return null;
};

interface ExchangeCardsSituationChartProps {
  dataType: string;
  timeRange: string;
  displayMode: string;
  onDataTypeChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  onDisplayModeChange: (value: string) => void;
}

export function ExchangeCardsSituationChart({ 
  dataType, 
  timeRange, 
  displayMode 
}: ExchangeCardsSituationChartProps) {
  const data = (dataType === 'cumulative' ? mockDataCumulative : mockDataNew).slice(
    -parseInt(timeRange)
  );

  // 根据displayMode决定显示的数据键
  const totalDataKey = displayMode === 'points' ? 'totalPoints' : 'totalCards';
  const exchangedDataKey = displayMode === 'points' ? 'exchangedPoints' : 'exchangedCards';

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
        />
        <Tooltip content={<CustomTooltip dataType={dataType} displayMode={displayMode} />} />
        <Line
          dataKey={totalDataKey}
          type="monotone"
          stroke={chartConfig.totalCards.color}
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey={exchangedDataKey}
          type="monotone"
          stroke={chartConfig.exchangedCards.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}