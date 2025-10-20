"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  onClick?: () => void;
  isSelected?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, onClick, isSelected }) => {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'}`}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;