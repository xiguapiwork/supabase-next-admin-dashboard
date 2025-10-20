'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddCommonVariableCardProps {
  onClick: () => void
}

export function AddCommonVariableCard({ onClick }: AddCommonVariableCardProps) {
  return (
    // Use the exact same classes as common-variable-card for the container, plus cursor-pointer
    <Card 
      className="relative flex flex-col cursor-pointer h-[270px]"
      onClick={onClick}
    >
      {/* --- Invisible Layout Skeleton (Pixel-Perfect Replica) --- */}
      {/* This skeleton now perfectly mimics the structure and spacing of common-variable-card */}
      <div className="invisible">
        {/* Header replica with placeholder for the Switch */}
        <CardHeader className="pb-2 px-4 pt-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-medium leading-tight">Placeholder</CardTitle>
            {/* Placeholder for the scaled Switch */}
            <div className="flex items-center gap-2 ml-2">
              <div style={{ height: '24px', width: '44px', transform: 'scale(1.25)' }} />
            </div>
          </div>
        </CardHeader>
        {/* Content replica with placeholders for Label and Input */}
        <CardContent className="space-y-1.5 px-4 flex-1 flex flex-col justify-center">
          <div className="transform translate-y-1">
            <div className="space-y-1">
              {/* Placeholder for Label */}
              <div className="h-[16px] w-8" /> 
              {/* Placeholder for Input */}
              <div className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
        {/* Footer replica (was already correct) */}
        <CardFooter className="px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full h-8 text-sm">编辑</Button>
        </CardFooter>
      </div>

      {/* --- Centered Content --- */}
      {/* This content is absolutely positioned to overlay the skeleton and be perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center shadow-sm">
            <Plus className="h-6 w-6 text-slate-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-white leading-relaxed">
              添加常用变量
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              存储您经常使用的文本内容和变量值
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}