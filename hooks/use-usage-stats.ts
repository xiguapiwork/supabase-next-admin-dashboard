'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TaskLog {
  创建时间: string;
  状态: string;
  [key: string]: any;
}

export interface UsageStatsData {
  date: string;
  totalUsage: number;
  successUsage: number;
  successRate: number;
}

export interface UseUsageStatsResult {
  data: UsageStatsData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsageStats(
  dataType: 'cumulative' | 'new',
  timeRange: number
): UseUsageStatsResult {
  const [data, setData] = useState<UsageStatsData[]>([]);
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
      
      // 获取任务日志数据
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('"创建时间", "状态"')
        .gte('"创建时间"', startDate.toISOString())
        .lte('"创建时间"', endDate.toISOString())
        .order('"创建时间"', { ascending: true });

      if (tasksError) {
        throw new Error(`获取任务数据失败: ${tasksError.message}`);
      }

      const tasks = (tasksData as any[]) || [];
      
      // 生成日期数组
      const dates: string[] = [];
      for (let i = 0; i < timeRange; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      let result: UsageStatsData[];

      if (dataType === 'cumulative') {
        // 累计数据：每天显示从开始到当天的累计数据
        result = dates.map((date, index) => {
          const currentDate = new Date(date);
          currentDate.setHours(23, 59, 59, 999);
          
          // 获取从开始日期到当前日期的所有任务
          const tasksUpToDate = tasks.filter((task: any) => {
            const taskDate = new Date(task['创建时间']);
            return taskDate <= currentDate;
          });
          
          const totalUsage = tasksUpToDate.length;
          const successUsage = tasksUpToDate.filter((task: any) => 
            task['状态'] === 'completed' || task['状态'] === '已完成'
          ).length;
          const successRate = totalUsage > 0 ? (successUsage / totalUsage) * 100 : 0;

          return {
            date,
            totalUsage,
            successUsage,
            successRate: Number(successRate.toFixed(2))
          };
        });
      } else {
        // 新增数据：每天显示当天的新增数据
        result = dates.map((date) => {
          const currentDate = new Date(date);
          const nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + 1);
          
          // 获取当天的任务
          const tasksOnDate = tasks.filter((task: any) => {
            const taskDate = new Date(task['创建时间']);
            return taskDate >= currentDate && taskDate < nextDate;
          });
          
          const totalUsage = tasksOnDate.length;
          const successUsage = tasksOnDate.filter((task: any) => 
            task['状态'] === 'completed' || task['状态'] === '已完成'
          ).length;
          const successRate = totalUsage > 0 ? (successUsage / totalUsage) * 100 : 0;

          return {
            date,
            totalUsage,
            successUsage,
            successRate: Number(successRate.toFixed(2))
          };
        });
      }

      setData(result);
    } catch (err) {
      console.error('获取使用统计数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [dataType, timeRange]);

  return {
    data,
    loading,
    error,
    refetch
  };
}