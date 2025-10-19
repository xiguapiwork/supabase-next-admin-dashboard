"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';

interface UserSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const UserSituationCard: React.FC<UserSituationCardProps> = ({ onClick, isSelected }) => {
  // 模拟数据
  const totalUsers = 2847;
  const paidUsers = 1233;
  const paymentRate = Math.round((paidUsers / totalUsers) * 100);

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''}`}
    >
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            用户情况
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 px-4 pb-4">
        {/* 状态标签和数字 */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            用户/总用户数
          </div>
          <div className="text-sm">
            {paidUsers.toLocaleString()} / <span className="font-bold">{totalUsers.toLocaleString()}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${paymentRate}%` }}
          ></div>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            付费率
          </div>
          <div className="text-xs font-bold">
            {paymentRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSituationCard;