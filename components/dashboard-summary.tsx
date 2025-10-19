"use client";
import React from 'react';
import SummaryCard from './summary-card';
import UserSituationCard from './user-situation-card';
import ExchangeCardsSituationCard from './exchange-cards-situation-card';
import PointsUsageSituationCard from './points-usage-situation-card';
import UsageCountSituationCard from './usage-count-situation-card';

export type MetricType = 
  | 'totalUsers' 
  | 'totalExchangeCards'
  | 'pointsUsage' 
  | 'usageCount';

interface DashboardSummaryProps {
  activeMetric: MetricType;
  setActiveMetric: (metric: MetricType) => void;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ activeMetric, setActiveMetric }) => {
  const summaryData = {
    totalUsers: { title: '总用户数', value: '2,847' },
    totalExchangeCards: { title: '总兑换卡数量', value: '1,256' },
    pointsUsage: { title: '积分使用情况', value: '18,567' },
    usageCount: { title: '使用次数', value: '8,567' },
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {Object.keys(summaryData).map((key) => {
        const metric = key as MetricType;
        const { title, value } = summaryData[metric];
        
        // 为总用户数使用特殊的用户情况卡片
        if (metric === 'totalUsers') {
          return (
            <UserSituationCard
              key={metric}
              onClick={() => setActiveMetric(metric)}
              isSelected={activeMetric === metric}
            />
          );
        }
        
        // 为总兑换卡数量使用特殊的兑换卡情况卡片
        if (metric === 'totalExchangeCards') {
          return (
            <ExchangeCardsSituationCard
              key={metric}
              onClick={() => setActiveMetric(metric)}
              isSelected={activeMetric === metric}
            />
          );
        }
        
        // 为积分使用情况使用特殊的积分使用情况卡片
        if (metric === 'pointsUsage') {
          return (
            <PointsUsageSituationCard
              key={metric}
              onClick={() => setActiveMetric(metric)}
              isSelected={activeMetric === metric}
            />
          );
        }
        
        // 为使用次数使用特殊的使用次数情况卡片
        if (metric === 'usageCount') {
          return (
            <UsageCountSituationCard
              key={metric}
              onClick={() => setActiveMetric(metric)}
              isSelected={activeMetric === metric}
            />
          );
        }
        
        return (
          <SummaryCard
            key={metric}
            title={title}
            value={value}
            onClick={() => setActiveMetric(metric)}
            isSelected={activeMetric === metric}
          />
        );
      })}
    </div>
  );
};

export default DashboardSummary;