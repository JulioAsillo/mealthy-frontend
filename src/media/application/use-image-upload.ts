import { computed, onScopeDispose, ref } from 'vue'
import { ApiError } from '@/shared/domain/model/api-error'
import { MAX_UPLOAD_BYTES } from '@/media/domain/model/image.entity'
import { mediaApi } from '@/media/infrastructure/media.api'
import { compressImage } from '@/media/infrastructure/image-compressor'

export type UploadPhase = 'idle' | 'compressing' | 'uploading' | 'processing' | 'done' | 'error'

const POLL_INTERVAL_MS = 700
/** Si el worker tarda más, se sigue igual: el backend acepta asociar imágenes en Processing. */
const POLL_TIMEOUT_MS = 20_000

/**
 * Caso de uso "subir una imagen": comprimir → pedir URL SAS → PUT al storage → confirmar → esperar al worker.
 * Devuelve el id que luego se envía como imageId en recetas, tiendas y productos.
 */
export function useImageUpload() {
  const phase = ref<UploadPhase>('idle')
  const error = ref<string | null>(null)
  let controller: AbortController | null = null

  const busy = computed(() => ['compressing', 'uploading', 'processing'].includes(phase.value))

  async function upload(file: File): Promise<number | null> {
    cancel()
    controller = new AbortController()
    const { signal } = controller
    error.value = null

    try {
      phase.value = 'compressing'
      const blob = await compressImage(file)
      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error(
          `La imagen pesa más de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB incluso comprimida.`,
        )
      }

      phase.value = 'uploading'
      const target = await mediaApi.createUpload({ contentType: blob.type, sizeBytes: blob.size })
      await mediaApi.uploadToStorage(target.uploadUrl, target.uploadHeaders, blob, signal)

      phase.value = 'processing'
      await mediaApi.complete(target.id)
      await waitUntilProcessed(target.id, signal)

      phase.value = 'done'
      return target.id
    } catch (e) {
      if (signal.aborted) {
        phase.value = 'idle'
        return null
      }
      phase.value = 'error'
      error.value = e instanceof ApiError ? e.userMessage : (e as Error).message
      return null
    }
  }

  function cancel() {
    controller?.abort()
    controller = null
  }

  onScopeDispose(cancel)

  return { phase, error, busy, upload, cancel }
}

async function waitUntilProcessed(id: number, signal: AbortSignal): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const image = await mediaApi.getById(id, signal)
    if (image.status === 'Ready') return
    if (image.status === 'Failed')
      throw new Error(image.failureReason ?? 'La imagen no se pudo procesar.')
    await sleep(POLL_INTERVAL_MS, signal)
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}
