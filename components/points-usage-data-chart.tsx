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
import { usePointsUsageStats } from '@/hooks/use-points-usage-stats';

const chartConfig = {
  totalPoints: {
    label: '总积分',
    color: 'hsl(var(--foreground))',
  },
  usedPoints: {
    label: '已使用积分',
    color: 'hsl(var(--muted-foreground))',
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      totalPoints: number;
      usedPoints: number;
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
    const usageRate = totalPoints > 0 ? ((usedPoints / totalPoints) * 100).toFixed(2) + '%' : '0%';

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

interface PointsUsageDataChartProps {
  dataType: string;
  timeRange: string;
}

export function PointsUsageDataChart({ dataType, timeRange }: PointsUsageDataChartProps) {
  const { data, loading, error } = usePointsUsageStats(
    dataType as 'cumulative' | 'new',
    parseInt(timeRange)
  );

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-destructive">加载失败: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

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
        <Tooltip content={<CustomTooltip dataType={dataType} />} />
        <Line
          dataKey="totalPoints"
          type="monotone"
          stroke={chartConfig.totalPoints.color}
          strokeWidth={2}
          dot={true}
        />
        <Line
          dataKey="usedPoints"
          type="monotone"
          stroke={chartConfig.usedPoints.color}
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}