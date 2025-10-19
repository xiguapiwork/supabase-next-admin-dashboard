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

// 模拟功能使用率数据
const mockDataCumulative = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    date: date.toISOString().split('T')[0],
    functionA: 75 + Math.floor(Math.random() * 20), // 75-95%
    functionB: 65 + Math.floor(Math.random() * 20), // 65-85%
    functionC: 55 + Math.floor(Math.random() * 20), // 55-75%
  };
}).reverse();

const mockDataNew = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    date: date.toISOString().split('T')[0],
    functionA: 70 + Math.floor(Math.random() * 25), // 70-95%
    functionB: 60 + Math.floor(Math.random() * 25), // 60-85%
    functionC: 50 + Math.floor(Math.random() * 25), // 50-75%
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
    const functionA = data.functionA;
    const functionB = data.functionB;
    const functionC = data.functionC;

    // 根据dataType显示不同的标题
    const title = dataType === 'new' ? '新增使用率' : '累计使用率';

    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">功能A</span>
          <span>{functionA}%</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">功能B</span>
          <span>{functionB}%</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">功能C</span>
          <span>{functionC}%</span>
        </div>
      </div>
    );
  }

  return null;
};

interface FunctionStatusRateChartProps {
  dataType: string;
  timeRange: string;
}

export function FunctionStatusRateChart({ dataType, timeRange }: FunctionStatusRateChartProps) {
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
          height={50}
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