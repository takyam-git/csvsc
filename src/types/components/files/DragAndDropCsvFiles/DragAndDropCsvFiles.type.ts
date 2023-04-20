export type CsvFile = {
  fileName: string
  fileSize: number
  fileType: string
  header: string[]
  rows: string[][]
  rowSize: number
  columnSize: number
}
