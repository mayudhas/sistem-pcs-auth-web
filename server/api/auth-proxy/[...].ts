export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const authBaseUrl = config.authServiceInternalUrl

  if (!authBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: AUTH_SERVICE_INTERNAL_URL is not set'
    })
  }

  // target relative path after /api/auth-proxy
  const path = event.context.params?._ || ''
  const targetUrl = `${authBaseUrl}/api/v1/${path}`

  return proxyRequest(event, targetUrl)
})
