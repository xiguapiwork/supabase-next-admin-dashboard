'use client'


import { RecentExchangeCard } from "@/components/recent-exchange-card"
import { RecentRegistrationCard } from "@/components/recent-registration-card"
import { PointsConsumptionCard } from "@/components/points-consumption-card"
import { UsageDetailsCard } from "@/components/usage-details-card"
import { FunctionDetailsCard } from "@/components/function-details-card"
import DashboardSummary, { MetricType } from "./dashboard-summary";
import { useState } from "react";
import { UsersOverallSituationChart } from "./users-overall-situation-chart";
import { ExchangeCardsChart } from "./exchange-cards-chart";
import { PointsUsageChart } from "./points-usage-chart";
import { UsageCountChart } from "./usage-count-chart";
import { FunctionStatusChart } from "./function-status-chart";

export function Dashboard() {
  const [activeMetric, setActiveMetric] = useState<MetricType>('totalUsers');

  // 根据选中的指标渲染对应的图表
  const renderChart = () => {
    switch (activeMetric) {
      case 'totalUsers':
        return <UsersOverallSituationChart />;
      case 'totalExchangeCards':
        return <ExchangeCardsChart />;
      case 'pointsUsage':
        return <PointsUsageChart />;
      case 'usageCount':
        return <UsageCountChart />;
      case 'functionStatus':
        return <FunctionStatusChart />;
      default:
        return <UsersOverallSituationChart />;
    }
  };

  // 根据选中的指标渲染对应的右侧内容
  const renderRightContent = () => {
    switch (activeMetric) {
      case 'totalUsers':
        return <RecentRegistrationCard />;
      case 'totalExchangeCards':
        return <RecentExchangeCard />;
      case 'pointsUsage':
        return <PointsConsumptionCard />;
      case 'usageCount':
        return <UsageDetailsCard />;
      case 'functionStatus':
        return <FunctionDetailsCard />;
      default:
        return <RecentRegistrationCard />;
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pt-1 pb-5 h-full">
      <DashboardSummary activeMetric={activeMetric} setActiveMetric={setActiveMetric} />
      {/* 外层容器 - 包裹表格和右侧卡片 */}
      <div className="w-full flex-1 p-0 flex gap-4">
        <div className="flex-1 min-w-0 flex flex-col">
          {renderChart()}
        </div>
        <div className="flex-shrink-0 h-fit">
          <div className="h-full">
            {renderRightContent()}
          </div>
        </div>
      </div>

    </div>
  )
}