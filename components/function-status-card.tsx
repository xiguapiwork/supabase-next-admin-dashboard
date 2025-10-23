"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroupCustom } from './ui/toggle-group-custom';
import { useFunctionStatus } from '@/hooks/use-function-status';

interface FunctionStatusCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const FunctionStatusCard: React.FC<FunctionStatusCardProps> = ({ onClick, isSelected }) => {
  const [viewMode, setViewMode] = useState('次数'); // '次数' 或 '人数'
  const { data: functionStatus, isLoading, error } = useFunctionStatus();
  
  // 根据视图模式获取数据
  const getFunctions = () => {
    // 如果正在加载，显示加载状态
    if (isLoading) {
      return [
        { name: '加载中...', progress: 0 },
        { name: '加载中...', progress: 0 },
        { name: '加载中...', progress: 0 },
      ];
    }
    
    // 如果有错误，显示错误状态
    if (error) {
      return [
        { name: '数据加载失败', progress: 0 },
        { name: '请检查网络连接', progress: 0 },
        { name: '稍后重试', progress: 0 },
      ];
    }
    
    if (!functionStatus || !functionStatus.functionStats || functionStatus.functionStats.length === 0) {
      return [
        { name: '暂无数据', progress: 0 },
        { name: '暂无数据', progress: 0 },
        { name: '暂无数据', progress: 0 },
      ];
    }
    
    if (viewMode === '次数') {
      // 按使用次数排序，显示使用次数的百分比
      const maxCount = Math.max(...functionStatus.functionStats.map(f => f.count), 1);
      return functionStatus.functionStats.map(func => ({
        name: func.name,
        progress: Math.round((func.count / maxCount) * 100)
      }));
    } else {
      // 按成功率排序，显示成功率
      return [...functionStatus.functionStats]
        .sort((a, b) => b.successRate - a.successRate)
        .map(func => ({
          name: func.name,
          progress: func.successRate
        }));
    }
  };
  
  const functions = getFunctions();

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col`}
      style={{ aspectRatio: '40/23', minWidth: '260px' }}
    >
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            功能情况
          </CardTitle>
          <ToggleGroupCustom
            options={['次数', '人数']}
            value={viewMode}
            onValueChange={setViewMode}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end space-y-2 pt-0 px-4 pb-4">
        {functions.map((func, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* 功能名称 - 占1/3宽度 */}
            <div className="w-1/3 text-xs font-medium text-gray-500 dark:text-gray-400">
              {func.name}
            </div>
            
            {/* 进度条 - 占2/3宽度 */}
            <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${func.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FunctionStatusCard;