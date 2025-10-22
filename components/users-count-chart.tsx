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
import { useUserCounts } from '@/hooks/use-user-counts';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  totalUsers: {
    label: '总用户数',
    color: 'hsl(var(--foreground))',
  },
  paidUsers: {
    label: '付费用户数',
    color: 'hsl(var(--muted-foreground))',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      totalUsers: number;
      paidUsers: number;
      date: string;
    };
  }>;
  label?: string;
  dataType: string;
}

const CustomTooltip = ({ active, payload, label, dataType }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalUsers = data.totalUsers;
    const paidUsers = data.paidUsers;
    const paymentRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) + '%' : '0%';

    // 根据dataType显示不同的标题
    const isCumulative = dataType === 'cumulative';
    const userLabel = isCumulative ? '总注册用户' : '新增注册用户';
    const paidUserLabel = isCumulative ? '总付费用户' : '新增付费用户';
    const rateLabel = isCumulative ? '总付费率' : '新增付费率';

    return (
      <div className="bg-popover text-popover-foreground p-4 border rounded shadow-lg w-[200px]">
        <p className="font-bold">{label ? new Date(label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }) : ''}</p>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{userLabel}</span>
          <span>{totalUsers}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{paidUserLabel}</span>
          <span>{paidUsers}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-bold">{rateLabel}</span>
          <span>{paymentRate}</span>
        </div>
      </div>
    );
  }

  return null;
};

export function UsersCountChart({ 
  dataType, 
  timeRange 
}: { 
  dataType: 'cumulative' | 'new';
  timeRange: number;
}) {
  const { data: userCounts, isLoading, error } = useUserCounts(timeRange, dataType);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-red-500">
        加载数据失败
      </div>
    );
  }

  if (!userCounts || userCounts.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-gray-500">
        暂无数据
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart data={userCounts}>
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
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Line
          dataKey="totalUsers"
          type="monotone"
          stroke={chartConfig.totalUsers.color}
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey="paidUsers"
          type="monotone"
          stroke={chartConfig.paidUsers.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}