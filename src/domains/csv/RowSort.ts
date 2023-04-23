import type { CsvFile } from '@/infrastructures/csv/CsvParser'
import { isNumeric } from '@/infrastructures/StringUtils'

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}
export enum SortType {
  String = 'string',
  Number = 'number'
}
export type SortKey = {
  index: number
  order: SortOrder
  type: SortType
}

const compareValues = (valueA: string, valueB: string, type: SortType) => {
  if (type === SortType.Number) {
    return isNumeric(valueA) && isNumeric(valueB) ? Number(valueA) - Number(valueB) : 0
  }

  return `${valueA}` < `${valueB}` ? -1 : `${valueA}` > `${valueB}` ? 1 : 0
}

const multiSortCsv = (
  list: string[][],
  sortKeys: { index: number; order: SortOrder; type: SortType }[]
) => {
  return list.slice().sort((a, b) => {
    for (let i = 0; i < sortKeys.length; i++) {
      const { index, order, type } = sortKeys[i]
      const comp = (order === SortOrder.Asc ? 1 : -1) * compareValues(a[index], b[index], type)
      if (comp !== 0) {
        return comp
      }
    }
    return 0
  })
}

export const sortCsvRows = (csv: CsvFile, sortKeys: SortKey[]): CsvFile => {
  if (csv.rowSize <= 1) {
    return { ...csv }
  }
  return { ...csv, rows: [csv.rows[0], ...multiSortCsv(csv.rows.slice(1), sortKeys)] }
}
