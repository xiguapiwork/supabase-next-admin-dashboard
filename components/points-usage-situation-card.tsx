"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Coins } from 'lucide-react';

interface PointsUsageSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const PointsUsageSituationCard: React.FC<PointsUsageSituationCardProps> = ({ onClick, isSelected }) => {
  // 模拟数据
  const usedPoints = 18567; // 已使用积分
  const totalExchangedPoints = 23456; // 总兑换积分
  const usageRate = Math.round((usedPoints / totalExchangedPoints) * 100); // 使用率

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''}`}
    >
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            积分使用情况
          </CardTitle>
          <Coins className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 px-4 pb-4">
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
      </CardContent>
    </Card>
  );
};

export default PointsUsageSituationCard;