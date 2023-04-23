import type { CsvFile, CsvRow } from '@/infrastructures/csv/CsvParser'

export const sortColumns = (csv: CsvFile, indexes: number[]): CsvFile => {
  const newRows = csv.rows.map((row: CsvRow) => indexes.map((index) => row[index]))
  return {
    ...csv,
    header: newRows[0],
    rows: newRows
  }
}
