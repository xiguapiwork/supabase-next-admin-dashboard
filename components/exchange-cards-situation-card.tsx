"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroupCustom } from './ui/toggle-group-custom';
import { Loader2 } from 'lucide-react';
import { useExchangeCardsStats } from '@/hooks/use-exchange-cards-stats';

interface ExchangeCardsSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const ExchangeCardsSituationCard: React.FC<ExchangeCardsSituationCardProps> = ({ onClick, isSelected }) => {
  const [viewMode, setViewMode] = useState('卡片'); // '卡片' 或 '积分'
  
  // 获取真实数据
  const { data: stats, isLoading, error } = useExchangeCardsStats();
  
  // 根据模式计算数据
  const currentRedeemed = viewMode === '卡片' 
    ? (stats?.redeemedCards || 0) 
    : (stats?.redeemedPoints || 0);
  const currentTotal = viewMode === '卡片' 
    ? (stats?.totalCards || 0) 
    : (stats?.totalPoints || 0);
  const redemptionRate = viewMode === '卡片' 
    ? (stats?.cardRedemptionRate || 0) 
    : (stats?.pointsRedemptionRate || 0);

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col`}
      style={{ aspectRatio: '40/23', minWidth: '260px' }}
    >
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            积分卡
          </CardTitle>
          <ToggleGroupCustom
            options={['卡片', '积分']}
            value={viewMode}
            onValueChange={setViewMode}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end space-y-2 pt-2 px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-16">
            <div className="text-xs text-red-500">数据加载失败</div>
          </div>
        ) : (
          <>
            {/* 状态标签和数字 */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                已兑换/总{viewMode}数
              </div>
              <div className="text-sm">
                {currentRedeemed.toLocaleString()} / <span className="font-bold">{currentTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* 进度条 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${redemptionRate}%` }}
              ></div>
            </div>

            {/* 底部信息 */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                兑换率
              </div>
              <div className="text-xs font-bold">
                {redemptionRate}%
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeCardsSituationCard;