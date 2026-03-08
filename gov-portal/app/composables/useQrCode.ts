import QRCode from 'qrcode'

interface QrCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

interface UseQrCodeReturn {
  qrCodeDataUrl: Ref<string>
  error: Ref<string | null>
}

export function useQrCode(
  urlRef: Ref<string>,
  options: QrCodeOptions = { width: 200, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }
): UseQrCodeReturn {
  const qrCodeDataUrl = ref<string>('')
  const error = ref<string | null>(null)

  watch(urlRef, async (newUrl: string) => {
    if (!newUrl) {
      qrCodeDataUrl.value = ''
      return
    }
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(newUrl, options)
      error.value = null
    } catch (err) {
      console.error('Error generating QR code:', err)
      error.value = 'Failed to generate QR code.'
      qrCodeDataUrl.value = ''
    }
  }, { immediate: true })

  return { qrCodeDataUrl, error }
}