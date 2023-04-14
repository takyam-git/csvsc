export const fileSizeLabel = (size: number) => {
  if (size <= 1024) {
    return `${size}B`
  }
  if (size <= 1024 * 1024) {
    return `${Math.round((size * 100) / 1024) / 100}KB`
  }
  if (size <= 1024 * 1024 * 1024) {
    return `${Math.round((size * 100) / 1024 / 1024) / 100}MB`
  }
  if (size <= 1024 * 1024 * 1024) {
    return `${Math.round((size * 100) / 1024 / 1024 / 1024) / 100}GB`
  }

  return `${Math.round((size * 100) / 1024 / 1024 / 1024 / 1024) / 100}TB`
}
