"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';
import { useUsageStats } from '@/hooks/use-usage-stats';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageCountSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const UsageCountSituationCard: React.FC<UsageCountSituationCardProps> = ({ onClick, isSelected }) => {
  const { data: usageData, loading } = useUsageStats('cumulative', 7);
  
  // 使用真实数据或回退到模拟数据
  const latestData = usageData && usageData.length > 0 ? usageData[usageData.length - 1] : null;
  const totalUsageCount = latestData?.totalUsage || 8567;
  const successCount = latestData?.successUsage || 7234;
  const successRate = latestData?.successRate || 84;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col`}
      style={{ aspectRatio: '40/23', minWidth: '260px' }}
    >
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            性能情况
          </CardTitle>
          <Activity className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end space-y-2 pt-2 px-4 pb-4">
        {/* 状态标签和数字 */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            成功/总使用数
          </div>
          <div className="text-sm">
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>
                {successCount.toLocaleString()} / <span className="font-bold">{totalUsageCount.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${successRate}%` }}
          ></div>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            成功率
          </div>
          <div className="text-xs font-bold">
            {loading ? (
              <Skeleton className="h-3 w-8" />
            ) : (
              `${successRate}%`
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageCountSituationCard;