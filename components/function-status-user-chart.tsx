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

// 模拟人数数据 - 累计
const mockDataCumulative = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    functionA: Math.floor(Math.random() * 50) + 100 + i * 2, // 功能A人数
    functionB: Math.floor(Math.random() * 40) + 80 + i * 1.5, // 功能B人数
    functionC: Math.floor(Math.random() * 30) + 60 + i * 1, // 功能C人数
  };
}).reverse();

// 模拟人数数据 - 新增
const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    functionA: Math.floor(Math.random() * 20) + 10, // 功能A新增人数
    functionB: Math.floor(Math.random() * 15) + 8, // 功能B新增人数
    functionC: Math.floor(Math.random() * 12) + 5, // 功能C新增人数
  };
}).reverse();

const chartConfig = {
  functionA: {
    label: '功能A',
    color: '#000000',
  },
  functionB: {
    label: '功能B',
    color: '#666666',
  },
  functionC: {
    label: '功能C',
    color: '#999999',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      functionA: number;
      functionB: number;
      functionC: number;
      date: string;
    };
  }>;
  label?: string;
  dataType: string;
}

const CustomTooltip = ({ active, payload, label, dataType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-foreground"></div>
              <span className="text-sm text-muted-foreground">功能A</span>
            </div>
            <span className="text-sm font-medium">
              {data.functionA}人
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span className="text-sm text-muted-foreground">功能B</span>
            </div>
            <span className="text-sm font-medium">
              {data.functionB}人
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span className="text-sm text-muted-foreground">功能C</span>
            </div>
            <span className="text-sm font-medium">
              {data.functionC}人
            </span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {dataType === 'cumulative' ? '累计人数' : '新增人数'}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface FunctionStatusUserChartProps {
  dataType: string;
  timeRange: string;
}

export function FunctionStatusUserChart({ dataType, timeRange }: FunctionStatusUserChartProps) {
  const data = dataType === 'cumulative' ? mockDataCumulative : mockDataNew;
  const filteredData = timeRange === '7' ? data.slice(-7) : data;

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart data={filteredData}>
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
                  {date.toLocaleDateString('zh-CN', {
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
          height={50}
        />
        <YAxis 
          strokeDasharray="3 3" 
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={60}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Line
          dataKey="functionA"
          type="monotone"
          stroke={chartConfig.functionA.color}
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey="functionB"
          type="monotone"
          stroke={chartConfig.functionB.color}
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey="functionC"
          type="monotone"
          stroke={chartConfig.functionC.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}