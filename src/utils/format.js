import dayjs from 'dayjs'

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

// 格式化日期（仅日期）
export function formatDateOnly(date) {
  return formatDate(date, 'YYYY-MM-DD')
}

// 格式化日期（仅时间）
export function formatTimeOnly(date) {
  return formatDate(date, 'HH:mm:ss')
}

