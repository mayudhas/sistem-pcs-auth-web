<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const config = useRuntimeConfig()
const authApi = config.public.authApiBase
const toast = useToast()

// Data state
const activeTab = ref('apps')
const apps = ref<any[]>([])
const isLoadingApps = ref(false)

// Forms
const newApp = reactive({
  app_id: '',
  app_nama: '',
  app_deskripsi: ''
})

const newAccount = reactive({
  username: '',
  password: '',
  is_superadmin: false
})

const newAssign = reactive({
  auth_id: '',
  app_id: '',
  app_role: 'ADMIN'
})

async function fetchApps() {
  isLoadingApps.value = true
  try {
    const res: any = await $fetch(`${authApi}/apps`)
    apps.value = res.data || []
  } catch (err: any) {
    console.error(err)
  } finally {
    isLoadingApps.value = false
  }
}

async function handleCreateApp() {
  try {
    await $fetch(`${authApi}/apps`, {
      method: 'POST',
      body: newApp
    })
    toast.add({ title: 'Sukses', description: `Aplikasi ${newApp.app_nama} terdaftar!`, color: 'success' })
    newApp.app_id = ''
    newApp.app_nama = ''
    newApp.app_deskripsi = ''
    await fetchApps()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal membuat aplikasi', color: 'error' })
  }
}

async function handleCreateAccount() {
  try {
    const res: any = await $fetch(`${authApi}/auth/accounts`, {
      method: 'POST',
      body: newAccount
    })
    toast.add({ title: 'Sukses', description: `Akun ${newAccount.username} berhasil dibuat! (auth_id: ${res.data.auth_id})`, color: 'success' })
    newAssign.auth_id = res.data.auth_id
    newAccount.username = ''
    newAccount.password = ''
    newAccount.is_superadmin = false
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal membuat akun', color: 'error' })
  }
}

async function handleAssignAccess() {
  try {
    await $fetch(`${authApi}/account-apps/assign`, {
      method: 'POST',
      body: newAssign
    })
    toast.add({ title: 'Sukses', description: 'Hak akses aplikasi berhasil ditetapkan!', color: 'success' })
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menetapkan akses', color: 'error' })
  }
}

onMounted(() => {
  fetchApps()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Navbar Header -->
    <header class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div class="flex items-center gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs">
          <UIcon name="i-lucide-shield-alert" class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold text-slate-900 tracking-tight">IAM Management Console</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Khusus Superadmin SSO
            </span>
          </div>
          <p class="text-xs text-slate-400">Pusat kontrol aplikasi satelit, akun, dan penetapan role</p>
        </div>
      </div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" />
        <span>Kembali ke Portal</span>
      </NuxtLink>
    </header>

    <!-- Main Workspace -->
    <div class="max-w-6xl mx-auto p-8 space-y-6">
      
      <!-- Navigasi Tab Modern -->
      <div class="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          :class="activeTab === 'apps' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'apps'"
        >
          <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
          <span>Daftar Client Apps</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          :class="activeTab === 'accounts' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'accounts'"
        >
          <UIcon name="i-lucide-users" class="w-4 h-4" />
          <span>Kelola Akun Baru</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          :class="activeTab === 'assign' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'assign'"
        >
          <UIcon name="i-lucide-key-round" class="w-4 h-4" />
          <span>Penugasan Hak Akses</span>
        </button>
      </div>

      <!-- TAB 1: CLIENT APPS -->
      <div v-if="activeTab === 'apps'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Form Tambah App -->
        <div class="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">Daftarkan Aplikasi Baru</h3>
            <p class="text-xs text-slate-400">Tambahkan sistem satelit yang akan diintegrasikan</p>
          </div>

          <form class="space-y-3.5" @submit.prevent="handleCreateApp">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">App ID</label>
              <input
                v-model="newApp.app_id"
                placeholder="misal: app-absensi"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Nama Aplikasi</label>
              <input
                v-model="newApp.app_nama"
                placeholder="misal: Sistem Presensi Karyawan"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Deskripsi</label>
              <textarea
                v-model="newApp.app_deskripsi"
                placeholder="Keterangan singkat..."
                rows="2"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UIcon name="i-lucide-plus-circle" class="w-4 h-4" />
              <span>Simpan Aplikasi</span>
            </button>
          </form>
        </div>

        <!-- List Apps -->
        <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Aplikasi Terdaftar ({{ apps.length }})</h3>
              <p class="text-xs text-slate-400">Sistem yang sudah dapat menerbitkan token SSO</p>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              :class="{ 'animate-spin': isLoadingApps }"
              @click="fetchApps"
            >
              <UIcon name="i-lucide-rotate-cw" class="w-4 h-4" />
            </button>
          </div>

          <div class="divide-y divide-slate-100">
            <div v-for="app in apps" :key="app.app_id" class="py-3.5 flex items-center justify-between">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">{{ app.app_nama }}</span>
                  <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {{ app.app_id }}
                  </span>
                </div>
                <p class="text-xs text-slate-500">{{ app.app_deskripsi || 'Tidak ada keterangan tambahan' }}</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ACCOUNTS -->
      <div v-if="activeTab === 'accounts'" class="max-w-md mx-auto bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Daftarkan Akun Baru</h3>
          <p class="text-xs text-slate-400">Buat kredensial login terpusat untuk pegawai atau admin</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleCreateAccount">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Username Akun</label>
            <input
              v-model="newAccount.username"
              placeholder="misal: budi_santoso"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Password Awal</label>
            <input
              v-model="newAccount.password"
              type="password"
              placeholder="minimal 6 karakter"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            />
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              id="is_superadmin_cb"
              v-model="newAccount.is_superadmin"
              type="checkbox"
              class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5 cursor-pointer"
            />
            <label for="is_superadmin_cb" class="text-xs cursor-pointer">
              <span class="font-bold text-slate-800 block">Jadikan Superadmin SSO</span>
              <span class="text-slate-500 text-[11px]">Centang hanya jika user ini boleh membuka Web Auth ini</span>
            </label>
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <UIcon name="i-lucide-user-plus" class="w-4 h-4" />
            <span>Simpan Akun Baru</span>
          </button>
        </form>
      </div>

      <!-- TAB 3: ASSIGN ACCESS -->
      <div v-if="activeTab === 'assign'" class="max-w-md mx-auto bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Tetapkan Hak Akses Aplikasi</h3>
          <p class="text-xs text-slate-400">Mapping user ke sistem yang diizinkan beserta rolenya</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleAssignAccess">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Auth ID (UUID User)</label>
            <input
              v-model="newAssign.auth_id"
              placeholder="01a15c..."
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
            />
            <p class="text-[11px] text-slate-400">Didapatkan saat akun pertama kali dibuat</p>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Pilih Aplikasi</label>
            <select
              v-model="newAssign.app_id"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="" disabled>-- Pilih Aplikasi --</option>
              <option v-for="app in apps" :key="app.app_id" :value="app.app_id">
                {{ app.app_nama }} ({{ app.app_id }})
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Role di Aplikasi Ini</label>
            <input
              v-model="newAssign.app_role"
              placeholder="misal: SUPERADMIN, ADMIN, VIEWER"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
            <span>Simpan Hak Akses</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
