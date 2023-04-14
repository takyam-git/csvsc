export type CsvFile = {
  uuid: string
  fileName: string
  fileSize: number
  fileType: string
  header: string[]
  rows: string[][]
  rowSize: number
  columnSize: number
  isParsed: boolean
  error: string | null
}
