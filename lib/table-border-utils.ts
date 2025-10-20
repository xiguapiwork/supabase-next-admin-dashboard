import type { TableBorderType } from '@/contexts/AppSettingsContext'

/**
 * 根据边框类型生成表格边框样式类名
 */
export function getTableBorderClasses(borderType: TableBorderType) {
  const baseClasses = 'border-gray-300 dark:border-gray-400'
  
  switch (borderType) {
    case 'horizontal':
      return {
        row: `border-b ${baseClasses} border-r-0`,
        cell: 'border-r-0',
        header: `border-b ${baseClasses} border-r-0`,
        headerCell: 'border-r-0'
      }
    case 'vertical':
      return {
        row: 'border-b-0',
        cell: `border-r ${baseClasses} border-b-0`,
        header: 'border-b-0',
        headerCell: `border-r ${baseClasses} border-b-0`
      }
    case 'both':
      return {
        row: `border-b ${baseClasses}`,
        cell: `border-r ${baseClasses}`,
        header: `border-b ${baseClasses}`,
        headerCell: `border-r ${baseClasses}`
      }
    default:
      return {
        row: `border-b ${baseClasses} border-r-0`,
        cell: 'border-r-0',
        header: `border-b ${baseClasses} border-r-0`,
        headerCell: 'border-r-0'
      }
  }
}