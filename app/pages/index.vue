<script setup lang="ts">
const authApi = '/api/auth-proxy'
const toast = useToast()

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const loginSuccessData = ref<any>(null)

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res: any = await $fetch(`${authApi}/auth/login`, {
      method: 'POST',
      body: form
    })

    loginSuccessData.value = res.data
    localStorage.setItem('sso_access_token', res.data.access_token)
    localStorage.setItem('sso_refresh_token', res.data.refresh_token)
    localStorage.setItem('sso_user', JSON.stringify(res.data.user))
    localStorage.setItem('sso_accessible_apps', JSON.stringify(res.data.accessible_apps || []))

    toast.add({
      title: 'Login Berhasil',
      description: `Selamat datang kembali, ${res.data.user.username}!`,
      color: 'success'
    })
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Login gagal, periksa username dan password Anda.'
    toast.add({
      title: 'Login Gagal',
      description: errorMessage.value,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('sso_access_token')
  localStorage.removeItem('sso_refresh_token')
  localStorage.removeItem('sso_user')
  localStorage.removeItem('sso_accessible_apps')
  loginSuccessData.value = null
}

onMounted(() => {
  const savedUser = localStorage.getItem('sso_user')
  const savedToken = localStorage.getItem('sso_access_token')
  const savedApps = localStorage.getItem('sso_accessible_apps')

  if (savedUser && savedToken) {
    try {
      loginSuccessData.value = {
        user: JSON.parse(savedUser),
        access_token: savedToken,
        accessible_apps: savedApps ? JSON.parse(savedApps) : []
      }
    } catch {}
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-slate-50">
    <!-- Navbar Minimalis -->
    <header class="w-full bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <UIcon name="i-lucide-shield-check" class="w-5 h-5" />
        </div>
        <div>
          <span class="font-bold text-slate-900 tracking-tight text-base">SSO Auth Portal</span>
          <span class="text-xs text-slate-400 font-medium block -mt-0.5">Satu Akun untuk Semua Sistem</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Server Aktif
        </span>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-[440px]">
        
        <!-- CARD LOGIN FORM (Murni Username & Password Saja) -->
        <div v-if="!loginSuccessData" class="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun</h2>
            <p class="text-xs text-slate-500 mt-1">Masukkan kredensial akun SSO Anda</p>
          </div>

          <div v-if="errorMessage" class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
            <div class="flex-1 leading-snug text-xs">{{ errorMessage }}</div>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Username</label>
              <div class="relative">
                <UIcon name="i-lucide-user" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  required
                  autofocus
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
              <div class="relative">
                <UIcon name="i-lucide-lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-white font-medium"
                />
                <button
                  type="button"
                  class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  @click="showPassword = !showPassword"
                >
                  <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
            >
              <UIcon v-if="isLoading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <UIcon v-else name="i-lucide-arrow-right" class="w-4 h-4" />
              <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk Sekarang' }}</span>
            </button>
          </form>
        </div>

        <!-- CARD SUDAH LOGIN (DASHBOARD PORTAL APLIKASI) -->
        <div v-else class="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div class="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-inner">
              {{ loginSuccessData.user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 truncate">{{ loginSuccessData.user.username }}</h3>
                <span v-if="loginSuccessData.user.is_superadmin" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  SSO Superadmin
                </span>
              </div>
              <p class="text-xs text-slate-400 font-mono truncate">ID: {{ loginSuccessData.user.auth_id }}</p>
            </div>
          </div>

          <!-- Kumpulan Aplikasi yang Boleh Diakses -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Aplikasi Anda</h4>
              <span class="text-[11px] text-slate-400">Total: {{ loginSuccessData.accessible_apps?.length || 0 }}</span>
            </div>

            <div v-if="loginSuccessData.accessible_apps && loginSuccessData.accessible_apps.length > 0" class="space-y-2">
              <div
                v-for="app in loginSuccessData.accessible_apps"
                :key="app.app_id"
                class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/80 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                    <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">{{ app.app_nama }}</h5>
                    <p class="text-[11px] text-slate-400">{{ app.app_deskripsi || app.app_id }}</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {{ app.app_role }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Belum ada aplikasi yang ditetapkan untuk akun Anda.
            </div>
          </div>

          <!-- Menu Khusus Superadmin SSO -->
          <div v-if="loginSuccessData.user.is_superadmin" class="pt-2 border-t border-slate-100">
            <NuxtLink
              to="/admin"
              class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <UIcon name="i-lucide-shield-alert" class="w-4 h-4 text-amber-400" />
              <span>Buka IAM Management Console</span>
            </NuxtLink>
          </div>

          <!-- Tombol Logout -->
          <button
            type="button"
            class="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="w-3.5 h-3.5 text-slate-400" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

      </div>
    </main>

    <!-- Footer Bersih -->
    <footer class="w-full text-center py-4 text-xs text-slate-400 border-t border-slate-200/60 bg-white">
      © {{ new Date().getFullYear() }} Centralized Single Sign-On • Standar Keamanan Kriptografi RS256
    </footer>
  </div>
</template>
