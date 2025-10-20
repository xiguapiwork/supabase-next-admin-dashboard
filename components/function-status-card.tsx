"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroupCustom } from './ui/toggle-group-custom';

interface FunctionStatusCardProps {
  onClick?: () => void;
  isSelected?: boolean;
}

const FunctionStatusCard: React.FC<FunctionStatusCardProps> = ({ onClick, isSelected }) => {
  const [viewMode, setViewMode] = useState('次数'); // '次数' 或 '人数'
  
  // 模拟功能状态数据 - 次数模式（功能一、功能二、功能三）
  const functionsUsage = [
    { name: '功能一', progress: 80 },
    { name: '功能二', progress: 60 },
    { name: '功能三', progress: 40 },
  ];
  
  // 模拟功能状态数据 - 人数模式（功能三、功能二、功能一）
  const functionsUsers = [
    { name: '功能三', progress: 70 },
    { name: '功能二', progress: 55 },
    { name: '功能一', progress: 35 },
  ];
  
  const functions = viewMode === '次数' ? functionsUsage : functionsUsers;

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