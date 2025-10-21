'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PointsExchangeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (points: number) => void
}

export function PointsExchangeDialog({ isOpen, onClose, onSuccess }: PointsExchangeDialogProps) {
  const [exchangeCode, setExchangeCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleExchange = async () => {
    if (!exchangeCode.trim()) {
      setError('请输入兑换码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 调用兑换卡片函数
      const { data, error: redeemError } = await supabase.rpc('redeem_card', {
        card_number: exchangeCode.trim()
      })

      if (redeemError) {
        console.error('兑换失败:', redeemError)
        if (redeemError.message.includes('not found') || redeemError.message.includes('不存在')) {
          setError('无效的兑换码')
        } else if (redeemError.message.includes('already redeemed') || redeemError.message.includes('已兑换')) {
          setError('该兑换码已被使用')
        } else {
          setError('兑换失败，请稍后重试')
        }
        return
      }

      if (!data) {
        setError('无效的兑换码或该兑换码已被使用')
        return
      }

      // 获取兑换的积分数量
      const { data: cardInfo, error: cardError } = await supabase
        .from('exchange-cards')
        .select('积分数量')
        .eq('卡号', exchangeCode.trim())
        .single()

      if (cardError || !cardInfo) {
        console.error('获取卡片信息失败:', cardError)
        setError('兑换成功，但无法获取积分信息')
        return
      }

      // 兑换成功
      const points = (cardInfo as unknown as Record<string, unknown>)['积分数量'] as number
      toast.success(`兑换成功！获得 ${points} 积分`)
      onSuccess(points)
      setExchangeCode('')
      onClose()

    } catch (error) {
      console.error('兑换过程中发生错误:', error)
      setError('兑换过程中发生错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setExchangeCode('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>积分兑换</DialogTitle>
          <DialogDescription>
            请输入您的兑换码来获取积分
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="exchangeCode">兑换码</Label>
            <Input
              id="exchangeCode"
              value={exchangeCode}
              onChange={(e) => {
                setExchangeCode(e.target.value)
                setError('') // 清除错误信息
              }}
              placeholder="请输入兑换码"
              className={error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleExchange}
            disabled={isLoading || !exchangeCode.trim()}
            className="w-full"
          >
            {isLoading ? '兑换中...' : '兑换'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}