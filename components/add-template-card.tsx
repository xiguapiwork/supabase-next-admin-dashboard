'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface AddTemplateCardProps {
  onClick: () => void
}

export function AddTemplateCard({ onClick }: AddTemplateCardProps) {
  return (
    <Card 
      className="relative flex flex-col cursor-pointer hover:shadow-md transition-shadow w-full h-fit min-w-[300px]"
      onClick={onClick}
    >
      <CardContent className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center shadow-sm">
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
              模版管理
            </h3>
            <p className="text-sm text-gray-600 leading-tight max-w-xs">
              创建和管理功能模版，快速应用到不同场景
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}