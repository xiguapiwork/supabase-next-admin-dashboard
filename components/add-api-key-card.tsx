'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddApiKeyCardProps {
  onClick: () => void
}

export function AddApiKeyCard({ onClick }: AddApiKeyCardProps) {
  return (
    // Use the exact same classes as api-key-card for the container, plus cursor-pointer
    <Card 
      className="relative flex flex-col cursor-pointer"
      style={{ aspectRatio: '3/2' }}
      onClick={onClick}
    >
      {/* --- Invisible Layout Skeleton (Pixel-Perfect Replica) --- */}
      {/* This skeleton now perfectly mimics the structure and spacing of api-key-card */}
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
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              增加您的第三方服务 KEY
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              为了安全，添加后您将无法查看和复制完整API KEY
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}