import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

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
    })

    const fileType = file.type
    let extractedData = null

    if (fileType === 'application/pdf') {
      extractedData = { message: 'PDF-Analyse folgt in Phase 1.2' }
    } else if (fileType.startsWith('image/')) {
      extractedData = { message: 'Bild-Analyse folgt in Phase 1.2' }
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileType,
      extractedData,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen: ' + error.message },
      { status: 500 }
    )
  }
}