import { BlobServiceClient } from '@azure/storage-blob'
import { randomUUID } from 'crypto'

const containerName = process.env.BLOB_CONTAINER_NAME ?? 'images'

let _client: BlobServiceClient | null = null

function getClient(): BlobServiceClient {
  if (!_client) {
    const connectionString = process.env.BLOB_CONNECTION_STRING
    if (!connectionString) throw new Error('BLOB_CONNECTION_STRING is required')
    _client = BlobServiceClient.fromConnectionString(connectionString)
  }
  return _client
}

let _containerClient: ReturnType<BlobServiceClient['getContainerClient']> | null = null

function getContainerClient() {
  if (!_containerClient) {
    _containerClient = getClient().getContainerClient(containerName)
  }
  return _containerClient
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_SIZE     = 5 * 1024 * 1024 // 5 MB

export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
): Promise<string> {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw Object.assign(new Error('Invalid image type'), { status: 400 })
  }
  if (buffer.byteLength > MAX_SIZE) {
    throw Object.assign(new Error('Image exceeds 5 MB limit'), { status: 400 })
  }

  const ext  = originalName.split('.').pop() ?? 'jpg'
  const blob = `${randomUUID()}.${ext}`

  const cc = getContainerClient()
  // Ensure public read access (idempotent)
  await cc.createIfNotExists({ access: 'blob' })

  const blockBlob = cc.getBlockBlobClient(blob)
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  })

  return blockBlob.url
}
