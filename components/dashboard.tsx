'use client'


import { RecentExchangeCard } from "@/components/recent-exchange-card"
import { RecentRegistrationCard } from "@/components/recent-registration-card"
import { PointsConsumptionCard } from "@/components/points-consumption-card"
import DashboardSummary, { MetricType } from "./dashboard-summary";
import { useState } from "react";
import { UsersOverallSituationChart } from "./users-overall-situation-chart";
import { ExchangeCardsChart } from "./exchange-cards-chart";
import { PointsUsageChart } from "./points-usage-chart";
import { UsageCountChart } from "./usage-count-chart";

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
      default:
        return <UsersOverallSituationChart />;
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pt-1 pb-5">
      <DashboardSummary activeMetric={activeMetric} setActiveMetric={setActiveMetric} />
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {renderChart()}
        </div>
        <div className="flex-shrink-0">
          <RecentRegistrationCard />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <RecentExchangeCard />
        </div>
        <div className="md:col-span-1">
          <PointsConsumptionCard />
        </div>
      </div>
    </div>
  )
}