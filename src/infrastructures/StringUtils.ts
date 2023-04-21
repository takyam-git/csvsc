export const ordinalSuffix = (number: number): string => {
  const j = number % 10
  const k = number % 100
  if (j === 1 && k !== 11) {
    return `${number}st`
  }
  if (j === 2 && k !== 12) {
    return `${number}nd`
  }
  if (j === 3 && k !== 13) {
    return `${number}rd`
  }
  return `${number}th`
}

const numberRegExp = /^[0-9]+(\.[0-9]+)?$/
export const isNumeric = (number: string | number | null | undefined): number is string => {
  if (typeof number !== 'string' && typeof number !== 'number') {
    return false
  }
  return numberRegExp.test(`${number}`)
}
