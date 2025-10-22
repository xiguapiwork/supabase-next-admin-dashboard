"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Coins, Loader2 } from 'lucide-react';
import { usePointsStats } from '@/hooks/use-points-stats';

interface PointsUsageSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const PointsUsageSituationCard: React.FC<PointsUsageSituationCardProps> = ({ onClick, isSelected }) => {
  const { data: pointsStats, isLoading, error } = usePointsStats();



  // 获取真实数据或默认值
  const usedPoints = pointsStats?.total_usage_points || 0;
  const totalExchangedPoints = pointsStats?.total_redeem_points || 0;
  const usageRate = pointsStats?.usage_rate || 0;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col`}
      style={{ aspectRatio: '40/23', minWidth: '260px' }}
    >
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            积分消耗
          </CardTitle>
          <Coins className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end space-y-2 pt-2 px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-red-500 text-center">
              数据加载失败
            </div>
          </div>
        ) : (
          <>
            {/* 状态标签和数字 */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                已使用/总积分
              </div>
              <div className="text-sm">
                {usedPoints.toLocaleString()} / <span className="font-bold">{totalExchangedPoints.toLocaleString()}</span>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${usageRate}%` }}
              ></div>
            </div>

            {/* 底部信息 */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                使用率
              </div>
              <div className="text-xs font-bold">
                {usageRate}%
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsUsageSituationCard;