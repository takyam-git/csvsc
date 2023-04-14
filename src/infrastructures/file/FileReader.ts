import Encoding from 'encoding-japanese'

export const readFile = async (file: File): Promise<string | null> => {
  return new Promise((resolve, reject): void => {
    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => {
        const result = reader.result
        if (!result) {
          resolve(null)
          return
        }
        if (typeof result === 'string') {
          resolve(result)
        } else {
          const unitArray = new Uint8Array(result)
          const encode = Encoding.detect(unitArray)
          resolve(
            Encoding.codeToString(
              Encoding.convert(unitArray, { from: encode || undefined, to: 'UNICODE' })
            )
          )
        }
      },
      false
    )
    reader.addEventListener('error', reject)
    reader.readAsArrayBuffer(file)
  })
}
