import type { CsvFile, CsvRow } from '@/infrastructures/csv/CsvParser'

export const filterColumns = (csv: CsvFile, indexes: number[]): CsvFile => {
  const newRows = csv.rows.map((row: CsvRow) => row.filter((_, index) => indexes.includes(index)))
  return {
    ...csv,
    header: newRows[0],
    rows: newRows,
    columnSize: newRows.length
  }
}
