'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupCustomProps {
  options: string[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  textSize?: string
}

export function ToggleGroupCustom({ 
  options, 
  value, 
  onValueChange, 
  className,
  textSize = "text-xs"
}: ToggleGroupCustomProps) {
  return (
    <div className={cn(
      "inline-flex h-8 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1", 
      className
    )}>
      {options.map((option) => {
        const isSelected = value === option
        
        return (
          <button
            key={option}
            onClick={() => onValueChange(option)}
            className={cn(
              `px-2 py-1 ${textSize} font-medium transition-all duration-200 rounded-md whitespace-nowrap`,
              "focus:outline-none",
              {
                // 选中状态 - 白色背景，深色文字
                "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm": isSelected,
                // 未选中状态 - 透明背景，灰色文字
                "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white": !isSelected,
              }
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}