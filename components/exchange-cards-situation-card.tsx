"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard } from 'lucide-react';

interface ExchangeCardsSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const ExchangeCardsSituationCard: React.FC<ExchangeCardsSituationCardProps> = ({ onClick, isSelected }) => {
  // 模拟数据
  const redeemedCards = 1233; // 已兑换积分卡
  const totalCards = 2847; // 总积分卡
  const redemptionRate = Math.round((redeemedCards / totalCards) * 100); // 兑换率

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            总兑换卡数量
          </CardTitle>
          <CreditCard className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          已兑换积分卡与总积分卡情况
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 状态标签和数字 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            已兑换积分卡/总积分卡
          </div>
          <div className="text-base">
            {redeemedCards.toLocaleString()} / <span className="font-bold">{totalCards.toLocaleString()}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${redemptionRate}%` }}
          ></div>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            兑换率
          </div>
          <div className="text-sm font-bold">
            {redemptionRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeCardsSituationCard;