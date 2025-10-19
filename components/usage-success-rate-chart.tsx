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
  const totalUsage = 1000 + i * 50 + Math.floor(Math.random() * 20);
  const successUsage = 800 + i * 40 + Math.floor(Math.random() * 15);
  const successRate = totalUsage > 0 ? (successUsage / totalUsage) * 100 : 0;
  return {
    date: date.toISOString().split('T')[0],
    totalUsage,
    successUsage,
    successRate: parseFloat(successRate.toFixed(2)),
  };
}).reverse();

const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const totalUsage = 30 + Math.floor(Math.random() * 15);
  const successUsage = 25 + Math.floor(Math.random() * 10);
  const successRate = totalUsage > 0 ? (successUsage / totalUsage) * 100 : 0;
  return {
    date: date.toISOString().split('T')[0],
    totalUsage,
    successUsage,
    successRate: parseFloat(successRate.toFixed(2)),
  };
}).reverse();

const chartConfig = {
  successRate: {
    label: '成功率',
    color: 'hsl(var(--chart-1))',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      totalUsage: number;
      successUsage: number;
      successRate: number;
      date: string;
    };
  }>;
  label?: string;
  dataType: string;
}

const CustomTooltip = ({ active, payload, label, dataType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalUsage = data.totalUsage;
    const successUsage = data.successUsage;
    const successRate = data.successRate;

    // 根据dataType显示不同的标题
    const titles = dataType === 'new' ? {
      totalUsage: '新增使用次数',
      successUsage: '当日成功次数',
      successRate: '成功率'
    } : {
      totalUsage: '功能使用次数',
      successUsage: '成功次数',
      successRate: '成功率'
    };

    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.totalUsage}</span>
          <span>{totalUsage}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.successUsage}</span>
          <span>{successUsage}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{titles.successRate}</span>
          <span>{successRate}%</span>
        </div>
      </div>
    );
  }

  return null;
};

interface UsageSuccessRateChartProps {
  dataType: string;
  timeRange: string;
}

export function UsageSuccessRateChart({ dataType, timeRange }: UsageSuccessRateChartProps) {
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
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Line
          dataKey="successRate"
          type="monotone"
          stroke={chartConfig.successRate.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}