'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface NumberPaginationProps {
  totalItems: number
  className?: string
}

export function NumberPagination({ totalItems, className }: NumberPaginationProps) {
  // 根据总条数决定显示的数字
  const getNumbers = () => {
    if (totalItems <= 5) {
      return [] // 5条或以下不显示数字
    } else if (totalItems <= 10) {
      return [1, 2] // 10条显示1-2
    } else if (totalItems <= 20) {
      return [1, 2, 3, 4] // 20条显示1-4
    } else if (totalItems <= 30) {
      return [1, 2, 3, 4, 5, 6] // 30条显示1-6
    } else {
      return [1, 2, 3, 4, 5, 6, 7, 8] // 40条显示1-8
    }
  }

  const numbers = getNumbers()
  const [selectedNumber, setSelectedNumber] = React.useState(numbers.length > 0 ? numbers[0] : null);


  return (
    <div className={cn("flex items-center justify-center py-1 pt-7 h-6", className)}>
      {numbers.length > 0 && (
        <div className="inline-flex">
          {numbers.map((number, index) => {
            const isFirst = index === 0
            const isLast = index === numbers.length - 1
            const isSelected = number === selectedNumber;
            
            return (
              <button
                key={number}
                onClick={() => setSelectedNumber(number)}
                className={cn(
                  "w-6 h-6 text-xs font-medium transition-colors focus:outline-none",
                  "border border-gray-200 dark:border-gray-700",
                  {
                    "rounded-l": isFirst,
                    "rounded-r": isLast,
                    "-ml-px": !isFirst, // 重叠边框，移除间隔
                  },
                  isSelected
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {number}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}