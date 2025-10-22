"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useUserStats } from '@/hooks/use-user-stats';

interface UserSituationCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const UserSituationCard: React.FC<UserSituationCardProps> = ({ onClick, isSelected }) => {
  const { data: userStats, isLoading, error } = useUserStats();

  // 使用真实数据或默认值
  const totalUsers = userStats?.totalUsers || 0;
  const paidUsers = userStats?.paidUsers || 0;
  const paymentRate = userStats?.paymentRate || 0;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col`}
      style={{ aspectRatio: '40/23', minWidth: '260px' }}
    >
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            用户情况
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-400" />
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
                付费/总用户数
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSituationCard;