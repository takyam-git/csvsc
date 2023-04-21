import { v4 } from 'uuid'
import Papa from 'papaparse'

export const downloadCSV = (csv: string, fileName?: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))

  const link = document.createElement('a')
  link.href = url
  link.download = fileName ?? `${v4()}.csv`
  link.style.display = 'block'
  link.style.width = '1px'
  link.style.height = '1px'
  link.style.opacity = '0'
  link.style.bottom = '0'
  link.style.right = '0'
  link.style.position = 'fixed'
  link.style.zIndex = '99999'

  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 0)
}

export const downloadCsvByRows = async (rows: string[][], fileName?: string) => {
  const newCsv = Papa.unparse(rows)
  downloadCSV(newCsv, fileName ?? `${v4()}.csv`)
}
