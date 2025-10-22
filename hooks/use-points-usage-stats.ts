'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PointsLog {
  创建时间: string;
  积分变动量: number;
  变动类型: string;
  [key: string]: any;
}

export interface PointsUsageData {
  date: string;
  totalPoints: number;
  usedPoints: number;
  usageRate: number;
}

export interface UsePointsUsageStatsResult {
  data: PointsUsageData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePointsUsageStats(
  dataType: 'cumulative' | 'new',
  timeRange: number
): UsePointsUsageStatsResult {
  const [data, setData] = useState<PointsUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // 计算日期范围
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeRange + 1);
      
      // 获取积分日志数据
      const { data: logsData, error: logsError } = await supabase
        .rpc('get_points_logs_list', {
          p_limit: 10000,
          p_offset: 0,
          p_search_term: '',
          p_action_filter: '',
          p_sort_field: '创建时间',
          p_sort_order: 'asc'
        });

      if (logsError) {
        throw new Error(`获取积分日志失败: ${logsError.message}`);
      }

      // 处理数据
      const processedData: PointsUsageData[] = [];
      
      for (let i = 0; i < timeRange; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (dataType === 'cumulative') {
          // 累计数据：计算到当前日期为止的总兑换积分和使用积分
          const logsUpToDate = (logsData as PointsLog[])?.filter((log: PointsLog) => 
            new Date(log.创建时间) <= currentDate
          ) || [];
          
          // 总兑换积分：card_redeem 类型的积分总和
          const totalPoints = logsUpToDate
            .filter((log: PointsLog) => log.变动类型 === 'card_redeem')
            .reduce((sum: number, log: PointsLog) => sum + log.积分变动量, 0);
          
          // 使用积分：所有扣分（负数）的总和
          const usedPoints = Math.abs(logsUpToDate
            .filter((log: PointsLog) => log.积分变动量 < 0)
            .reduce((sum: number, log: PointsLog) => sum + log.积分变动量, 0));
          
          const usageRate = totalPoints > 0 ? (usedPoints / totalPoints) * 100 : 0;
          
          processedData.push({
            date: dateStr,
            totalPoints,
            usedPoints,
            usageRate
          });
        } else {
          // 新增数据：只计算当天的积分变化
          const nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + 1);
          
          const dailyLogs = (logsData as PointsLog[])?.filter((log: PointsLog) => {
            const logDate = new Date(log.创建时间);
            return logDate >= currentDate && logDate < nextDate;
          }) || [];
          
          // 新增积分数量：当天 card_redeem 类型的积分总和
          const totalPoints = dailyLogs
            .filter((log: PointsLog) => log.变动类型 === 'card_redeem')
            .reduce((sum: number, log: PointsLog) => sum + log.积分变动量, 0);
          
          // 当天扣分总和：当天所有扣分（负数）的总和
          const usedPoints = Math.abs(dailyLogs
            .filter((log: PointsLog) => log.积分变动量 < 0)
            .reduce((sum: number, log: PointsLog) => sum + log.积分变动量, 0));
          
          const usageRate = totalPoints > 0 ? (usedPoints / totalPoints) * 100 : 0;
          
          processedData.push({
            date: dateStr,
            totalPoints,
            usedPoints,
            usageRate
          });
        }
      }
      
      setData(processedData);
    } catch (err) {
      console.error('获取积分使用统计失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType, timeRange]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}