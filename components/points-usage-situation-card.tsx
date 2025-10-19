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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            积分使用情况
          </CardTitle>
          <Coins className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          已使用积分与总兑换积分情况
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 状态标签和数字 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            已使用积分/总兑换积分
          </div>
          <div className="text-base">
            {usedPoints.toLocaleString()} / <span className="font-bold">{totalExchangedPoints.toLocaleString()}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${usageRate}%` }}
          ></div>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            使用率
          </div>
          <div className="text-sm font-bold">
            {usageRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsUsageSituationCard;