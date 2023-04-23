export const range = <T = any>(size: number, value: T): T[] => {
  const array = new Array<T>(size)
  array.fill(value)
  return array
}

export const sequential = (size: number, start: number = 0): number[] => {
  return Array.from({ length: size }, (_, index) => index + start)
}

const calcNewIndex = (array: any[], newIndex: number): number => {
  if (newIndex < 0) {
    return 0
  }
  if (newIndex > array.length - 1) {
    return array.length - 1
  }
  return newIndex
}
export const moveElement = <T>(array: T[], index: number, distance: number): T[] => {
  const newArray = [...array] // 配列のコピーを作成
  if (distance === 0) {
    return newArray
  }
  const newIndex = calcNewIndex(array, index + distance)
  const removedElement = newArray.splice(index, 1)[0]
  newArray.splice(newIndex, 0, removedElement)
  return newArray
}
