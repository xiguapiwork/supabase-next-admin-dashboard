"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

interface UsageCountSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const UsageCountSituationCard: React.FC<UsageCountSituationCardProps> = ({ onClick, isSelected }) => {
  // 模拟数据
  const successCount = 7234; // 成功数
  const totalUsageCount = 8567; // 使用总数
  const successRate = Math.round((successCount / totalUsageCount) * 100); // 成功率

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            使用次数
          </CardTitle>
          <Activity className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          成功使用次数与总使用次数情况
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 状态标签和数字 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            成功数/使用总数
          </div>
          <div className="text-base">
            {successCount.toLocaleString()} / <span className="font-bold">{totalUsageCount.toLocaleString()}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${successRate}%` }}
          ></div>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            成功率
          </div>
          <div className="text-sm font-bold">
            {successRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageCountSituationCard;