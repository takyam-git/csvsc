import type { CsvFile, CsvRow, CsvRows } from '@/infrastructures/csv/CsvParser'

export type NewColumn = {
  preIndex: number
  name: string
}

export const addColumns = (csv: CsvFile, newColumns: NewColumn[]): CsvFile => {
  const copied = [...newColumns]
  copied.sort((a, b) => a.preIndex - b.preIndex)
  const sorted = copied.reverse()
  const newHeaderRow: CsvRow = [...csv.rows[0]]
  sorted.forEach(({ preIndex, name }) => newHeaderRow.splice(preIndex + 1, 0, name))

  const newTailRows: CsvRows = [...csv.rows].slice(1).map((row) => {
    const newRow: CsvRow = [...row]
    sorted.forEach(({ preIndex }) => newRow.splice(preIndex + 1, 0, ''))
    return newRow
  })

  const newRows = [newHeaderRow, ...newTailRows]

  return {
    ...csv,
    header: newRows[0],
    columnSize: newRows[0].length,
    rows: newRows
  }
}
