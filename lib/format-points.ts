/**
 * 格式化积分显示
 * @param points 积分数值
 * @param format 显示格式：'integer' 整数 | 'decimal' 2位小数
 * @returns 格式化后的积分字符串
 */
export function formatPoints(points: number, format: 'integer' | 'decimal' = 'integer'): string {
  if (format === 'decimal') {
    return points.toFixed(2)
  }
  return Math.floor(points).toString()
}