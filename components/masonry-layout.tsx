'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface MasonryLayoutProps {
  children: React.ReactNode[]
  columns?: {
    default: number
    md: number
    lg: number
  }
  gap?: number
  className?: string
}

export function MasonryLayout({ 
  children, 
  columns = { default: 1, md: 2, lg: 3 }, 
  gap = 16,
  className = '' 
}: MasonryLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(columns.default)
  const [isClient, setIsClient] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  // 确保在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 响应式列数计算 - 添加防抖处理
  useEffect(() => {
    if (!isClient) return

    let timeoutId: NodeJS.Timeout

    const updateColumns = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        let newColumnCount = columns.default
        
        if (width >= 1024) {
          newColumnCount = columns.lg
        } else if (width >= 768) {
          newColumnCount = columns.md
        }
        
        setColumnCount(newColumnCount)
        
        // 同时更新容器宽度
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth)
        }
      }, 100) // 100ms 防抖
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => {
      window.removeEventListener('resize', updateColumns)
      clearTimeout(timeoutId)
    }
  }, [columns, isClient])

  // 移除单独的容器宽度监听，已合并到上面的响应式处理中

  // 瀑布流布局计算函数
  const calculateLayout = useCallback(() => {
    if (!isClient || !containerRef.current || containerWidth === 0) return

    const container = containerRef.current
    const items = Array.from(container.children) as HTMLElement[]
    
    if (items.length === 0) return

    // 计算列宽
    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount

    // 调试输出
    console.log('MasonryLayout Debug:', {
      containerWidth,
      columnCount,
      gap,
      columnWidth,
      calculatedPercentage: (columnWidth / containerWidth * 100).toFixed(2) + '%'
    })

    // 重置所有项目的样式 - 移除过渡效果避免初始化动画
    items.forEach(item => {
      item.style.position = 'absolute'
      item.style.top = '0'
      item.style.left = '0'
      item.style.width = `${columnWidth}px`
      // 只在布局准备好后添加过渡效果
      item.style.transition = isLayoutReady ? 'all 0.3s ease-out' : 'none'
    })

    // 使用多次requestAnimationFrame确保元素已完全渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const columnHeights = new Array(columnCount).fill(0)
        
        items.forEach((item) => {
          // 找到最短的列
          const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
          
          // 计算位置
          const x = shortestColumnIndex * (columnWidth + gap)
          const y = columnHeights[shortestColumnIndex]
          
          // 设置位置
          item.style.left = `${x}px`
          item.style.top = `${y}px`
          
          // 更新列高度 - 确保获取到正确的高度
          const itemHeight = item.offsetHeight || item.getBoundingClientRect().height
          columnHeights[shortestColumnIndex] += itemHeight + gap
        })
        
        // 设置容器高度
        const maxHeight = Math.max(...columnHeights) - gap
        container.style.height = `${maxHeight}px`
        
        // 布局计算完成后设置为准备状态
        if (!isLayoutReady) {
          setIsLayoutReady(true)
        }
      })
    })
  }, [columnCount, gap, isClient, containerWidth, isLayoutReady])

  // 当依赖项变化时重新计算布局
  useEffect(() => {
    calculateLayout()
  }, [calculateLayout, children])

  if (!isClient) {
    // 服务端渲染时使用简单的Grid布局作为fallback
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} style={{ minWidth: '1248px' }}>
        {children}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ 
        position: 'relative',
        minWidth: columnCount === 4 ? '1248px' : undefined,
        transition: 'min-width 0.3s ease-out', // 添加容器过渡效果
        opacity: isLayoutReady ? 1 : 0, // 布局准备好后才显示
        visibility: isLayoutReady ? 'visible' : 'hidden' // 避免初始化时的闪烁
      }}
    >
      {children}
    </div>
  )
}