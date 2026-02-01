import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { extractTextFromPDF } from '@/lib/pdf-extractor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Datei zu gross (max 10MB)' },
        { status: 400 }
      )
    }

    const blob = await put(file.name, file, {
      access: 'public',
addRandomSuffix: true,
    })

    let extractedText = ''
    const fileType = file.type

    if (fileType === 'application/pdf') {
      try {
        extractedText = await extractTextFromPDF(blob.url)
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'PDF-Textextraktion fehlgeschlagen. Bitte Daten manuell eingeben.',
          url: blob.url,
        })
      }
    } else if (fileType.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Bild-OCR noch nicht implementiert. Bitte Daten manuell eingeben.',
        url: blob.url,
      })
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileType,
      fileName: file.name,
      extractedText,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen: ' + error.message },
      { status: 500 }
    )
  }
}