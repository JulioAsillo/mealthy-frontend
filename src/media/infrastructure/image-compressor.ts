import { isAcceptedImageType } from '@/media/domain/model/image.entity'

export interface CompressOptions {
  /** Lado mayor máximo en píxeles. Igual a la variante "lg" del backend: subir más es desperdicio. */
  maxSize?: number
  /** 0–1 */
  quality?: number
}

/**
 * Redimensiona y re-codifica en el navegador ANTES de subir: una foto de móvil de 4–8 MB
 * suele quedar en 200–500 KB. El backend vuelve a procesarla igual (nunca confía en el cliente).
 *
 * WebP si el navegador lo sabe codificar en canvas; si no (Safari), JPEG.
 * Si el resultado pesa más que el original y el original ya es válido, se sube el original.
 */
export async function compressImage(
  file: File,
  { maxSize = 1600, quality = 0.85 }: CompressOptions = {},
): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('El navegador no puede leer este archivo. Usa JPG, PNG o WebP.')
  }

  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo preparar la imagen.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    // toBlob devuelve PNG si no soporta el tipo pedido: se detecta por blob.type
    let blob = await toBlob(canvas, 'image/webp', quality)
    if (blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality)

    const originalIsUsable = isAcceptedImageType(file.type) && scale === 1
    return originalIsUsable && file.size <= blob.size ? file : blob
  } finally {
    bitmap.close()
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.'))),
      type,
      quality,
    ),
  )
}
