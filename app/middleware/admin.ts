export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const token = localStorage.getItem('sso_access_token')
  const userStr = localStorage.getItem('sso_user')

  if (!token || !userStr) {
    return navigateTo('/')
  }

  try {
    const user = JSON.parse(userStr)
    // Hanya Superadmin Web Auth yang boleh masuk ke Admin Console
    if (!user.is_superadmin) {
      return navigateTo('/')
    }
  } catch {
    return navigateTo('/')
  }
})
