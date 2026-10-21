export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const token = localStorage.getItem('sso_access_token')
  const userStr = localStorage.getItem('sso_user')

  if (!token || !userStr) {
    return navigateTo('/')
  }

  try {
    const user = JSON.parse(userStr)
    if (user.username !== 'superadmin' && user.app_role !== 'SUPERADMIN') {
      return navigateTo('/')
    }
  } catch {
    return navigateTo('/')
  }
})
