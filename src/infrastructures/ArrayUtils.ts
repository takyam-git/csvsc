export const range = <T = any>(size: number, value: T): T[] => {
  const array = new Array<T>(size)
  array.fill(value)
  return array
}

export const sequential = (size: number, start: number = 0): number[] => {
  return Array.from({ length: size }, (_, index) => index + start)
}
