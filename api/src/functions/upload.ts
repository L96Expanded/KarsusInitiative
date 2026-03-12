import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions'
import Busboy from 'busboy'
import { uploadImage } from '../lib/blobStorage'
import { authenticate } from '../lib/auth'

function err(message: string, status = 400): HttpResponseInit {
  return { status, jsonBody: { message } }
}

async function upload(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    authenticate(req) // must be logged in

    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return err('Expected multipart/form-data')
    }

    // Read the entire body into a buffer first, then feed to Busboy.
    // Azure Functions v4 Web Streams pipeTo() has async timing issues with Busboy.
    const bodyBuffer = Buffer.from(await req.arrayBuffer())

    const url = await new Promise<string>((resolve, reject) => {
      const bb = Busboy({ headers: { 'content-type': contentType } })
      // Track whether a file part was seen (not whether upload finished).
      // 'finish' fires synchronously after bb.end() — before the async uploadImage()
      // resolves — so checking `resolved` here would always be false.
      let fileSeen = false

      bb.on('file', (_field: string, stream: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
        fileSeen = true
        const { filename, mimeType } = info
        const chunks: Buffer[] = []

        stream.on('data', (chunk: Buffer) => chunks.push(chunk))
        stream.on('end', async () => {
          try {
            const buffer   = Buffer.concat(chunks)
            const imageUrl = await uploadImage(buffer, mimeType, filename)
            resolve(imageUrl)
          } catch (e) {
            reject(e)
          }
        })
        stream.on('error', reject)
      })

      bb.on('finish', () => {
        if (!fileSeen) reject(new Error('No file provided'))
      })
      bb.on('error', reject)

      bb.write(bodyBuffer)
      bb.end()
    })

    return { status: 200, jsonBody: { url } }
  } catch (e: unknown) {
    const status  = (e as { status?: number }).status ?? 500
    const message = e instanceof Error ? e.message : 'Upload failed'
    return err(message, status)
  }
}

app.http('upload', { methods: ['POST'], route: 'upload', authLevel: 'anonymous', handler: upload })
