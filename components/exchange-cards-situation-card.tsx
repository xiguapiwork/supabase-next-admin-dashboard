"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroupCustom } from './ui/toggle-group-custom';

interface ExchangeCardsSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const ExchangeCardsSituationCard: React.FC<ExchangeCardsSituationCardProps> = ({ onClick, isSelected }) => {
  const [viewMode, setViewMode] = useState('卡片'); // '卡片' 或 '积分'
  
  // 模拟数据
  const redeemedCards = 1233; // 已兑换积分卡数量
  const totalCards = 2847; // 总积分卡数量
  const redeemedPoints = 18567; // 已兑换积分总数
  const totalPoints = 23456; // 总积分数
  
  // 根据模式计算数据
  const currentRedeemed = viewMode === '卡片' ? redeemedCards : redeemedPoints;
  const currentTotal = viewMode === '卡片' ? totalCards : totalPoints;
  const redemptionRate = Math.round((currentRedeemed / currentTotal) * 100); // 兑换率

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''} h-full flex flex-col`}
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
      </CardContent>
    </Card>
  );
};

export default ExchangeCardsSituationCard;