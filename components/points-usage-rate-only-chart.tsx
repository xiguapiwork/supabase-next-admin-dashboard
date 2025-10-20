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
  const totalPoints = 10000 + i * 500 + Math.floor(Math.random() * 200);
  const usedPoints = 3000 + i * 150 + Math.floor(Math.random() * 100);
  return {
    date: date.toISOString().split('T')[0],
    totalPoints,
    usedPoints,
    usageRate: totalPoints > 0 ? (usedPoints / totalPoints) * 100 : 0,
  };
}).reverse();

const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const totalPoints = 200 + Math.floor(Math.random() * 100);
  const usedPoints = 50 + Math.floor(Math.random() * 50);
  return {
    date: date.toISOString().split('T')[0],
    totalPoints,
    usedPoints,
    usageRate: totalPoints > 0 ? (usedPoints / totalPoints) * 100 : 0,
  };
}).reverse();

const chartConfig = {
  usageRate: {
    label: '积分使用率',
    color: 'hsl(var(--foreground))',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      totalPoints: number;
      usedPoints: number;
      usageRate: number;
      date: string;
    };
  }>;
  label?: string;
  dataType: string;
}

const CustomTooltip = ({ active, payload, label, dataType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalPoints = data.totalPoints;
    const usedPoints = data.usedPoints;
    const usageRate = data.usageRate.toFixed(2) + '%';

    // 根据dataType显示不同的标题
    const titles = dataType === 'new' ? {
      totalPoints: '新增积分数量',
      usedPoints: '当日使用积分',
      usageRate: '积分使用率'
    } : {
      totalPoints: '总兑换积分',
      usedPoints: '已使用积分',
      usageRate: '使用率'
    };

    return (
      <div className="bg-popover text-popover-foreground p-4 border rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.totalPoints}</span>
          <span>{totalPoints}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.usedPoints}</span>
          <span>{usedPoints}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.usageRate}</span>
          <span>{usageRate}</span>
        </div>
      </div>
    );
  }

  return null;
};

interface PointsUsageRateOnlyChartProps {
  dataType: string;
  timeRange: string;
}

export function PointsUsageRateOnlyChart({ dataType, timeRange }: PointsUsageRateOnlyChartProps) {
  const data = (dataType === 'cumulative' ? mockDataCumulative : mockDataNew).slice(
    -parseInt(timeRange)
  );

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
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Line
          dataKey="usageRate"
          type="monotone"
          stroke={chartConfig.usageRate.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}