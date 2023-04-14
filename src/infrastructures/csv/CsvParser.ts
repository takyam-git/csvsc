import Papa from 'papaparse'

export type CsvFile = {
  header: string[]
  rows: string[][]
  rowSize: number
  columnSize: number
}

export const parseCsv = async (csv: string): Promise<CsvFile> => {
  const parsed = Papa.parse<string[]>(csv)
  const firstNonEmptyRowIndex = parsed.data.findIndex((row) => !isEmptyRow(row))
  let maxColumnSize = 0
  parsed.data.forEach((row) => {
    if (row.length > maxColumnSize) {
      maxColumnSize = row.length
    }
  })
  const rows = parsed.data.slice(
    firstNonEmptyRowIndex < 0 ? 0 : firstNonEmptyRowIndex,
    parsed.data.length
  )
  return {
    header: rows[0] ?? [],
    rows,
    rowSize: rows.length,
    columnSize: maxColumnSize
  }
}

export const isEmptyRow = (row: string[]) => {
  return row.length === 0 || row.every((cell) => cell.trim() === '')
}
