export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const loadingTask = pdfjsLib.getDocument(fileUrl)
    const pdf = await loadingTask.promise

    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Konnte Text nicht aus PDF extrahieren')
  }
}