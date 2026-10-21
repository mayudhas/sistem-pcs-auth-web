<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})

const authApi = '/api/auth-proxy'
const toast = useToast()

// Data state
const activeTab = ref('apps')
const apps = ref<any[]>([])
const accounts = ref<any[]>([])
const isLoadingApps = ref(false)
const isLoadingAccounts = ref(false)

// Role management modal state
const selectedAppForRoles = ref<any>(null)
const appRoles = ref<any[]>([])
const isLoadingRoles = ref(false)
const newRole = reactive({
  role_code: '',
  role_nama: '',
  role_deskripsi: ''
})

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
  app_role: ''
})
const availableRolesForAssign = ref<any[]>([])

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

async function fetchAccounts() {
  isLoadingAccounts.value = true
  try {
    const res: any = await $fetch(`${authApi}/auth/accounts`)
    accounts.value = res.data || []
  } catch (err: any) {
    console.error(err)
  } finally {
    isLoadingAccounts.value = false
  }
}

async function handleCreateApp() {
  try {
    await $fetch(`${authApi}/apps`, {
      method: 'POST',
      body: newApp
    })
    toast.add({ title: 'Sukses', description: 'Aplikasi berhasil didaftarkan!', color: 'success' })
    newApp.app_id = ''
    newApp.app_nama = ''
    newApp.app_deskripsi = ''
    await fetchApps()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal membuat aplikasi', color: 'error' })
  }
}

async function handleDeleteApp(appId: string) {
  if (!confirm(`Yakin ingin menghapus aplikasi '${appId}'? Seluruh role dan mapping user di aplikasi ini akan dihapus.`)) return

  try {
    await $fetch(`${authApi}/apps/${appId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Terhapus', description: `Aplikasi ${appId} berhasil dihapus!`, color: 'success' })
    await fetchApps()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menghapus aplikasi', color: 'error' })
  }
}

async function handleCreateAccount() {
  try {
    const res: any = await $fetch(`${authApi}/auth/accounts`, {
      method: 'POST',
      body: newAccount
    })
    toast.add({
      title: 'Akun Terdaftar',
      description: `User '${res.data.auth_username}' berhasil dibuat. Auth ID: ${res.data.auth_id}`,
      color: 'success'
    })
    newAccount.username = ''
    newAccount.password = ''
    newAccount.is_superadmin = false
    await fetchAccounts()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal membuat akun', color: 'error' })
  }
}

async function handleDeleteAccount(authId: string, username: string) {
  if (username === 'superadmin') {
    alert('Akun superadmin utama tidak boleh dihapus!')
    return
  }
  if (!confirm(`Yakin ingin menghapus permanen akun '${username}'? Seluruh aksesnya akan dicabut.`)) return

  try {
    await $fetch(`${authApi}/auth/accounts/${authId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Terhapus', description: `Akun ${username} berhasil dihapus!`, color: 'success' })
    await fetchAccounts()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menghapus akun', color: 'error' })
  }
}

// Roles modal actions
async function openRolesModal(app: any) {
  selectedAppForRoles.value = app
  await fetchAppRoles(app.app_id)
}

async function fetchAppRoles(appId: string) {
  isLoadingRoles.value = true
  try {
    const res: any = await $fetch(`${authApi}/apps/${appId}/roles`)
    appRoles.value = res.data || []
  } catch (err: any) {
    console.error(err)
  } finally {
    isLoadingRoles.value = false
  }
}

async function handleAddRole() {
  if (!selectedAppForRoles.value) return
  try {
    await $fetch(`${authApi}/apps/${selectedAppForRoles.value.app_id}/roles`, {
      method: 'POST',
      body: {
        role_code: newRole.role_code.trim().toUpperCase(),
        role_nama: newRole.role_nama.trim(),
        role_deskripsi: newRole.role_deskripsi.trim() || undefined
      }
    })
    toast.add({ title: 'Role Ditambahkan', description: `Role ${newRole.role_code} berhasil dibuat`, color: 'success' })
    newRole.role_code = ''
    newRole.role_nama = ''
    newRole.role_deskripsi = ''
    await fetchAppRoles(selectedAppForRoles.value.app_id)
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menambah role', color: 'error' })
  }
}

async function handleDeleteRole(roleId: string, roleCode: string) {
  if (!confirm(`Hapus role '${roleCode}' dari aplikasi ini?`)) return
  try {
    await $fetch(`${authApi}/apps/${selectedAppForRoles.value.app_id}/roles/${roleId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Role Dihapus', description: `Role ${roleCode} berhasil dihapus`, color: 'success' })
    await fetchAppRoles(selectedAppForRoles.value.app_id)
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menghapus role', color: 'error' })
  }
}

// Watch app_id in Assign Tab to load defined roles
watch(() => newAssign.app_id, async (appId) => {
  newAssign.app_role = ''
  availableRolesForAssign.value = []
  if (!appId) return
  try {
    const res: any = await $fetch(`${authApi}/apps/${appId}/roles`)
    availableRolesForAssign.value = res.data || []
  } catch (e) {
    console.error(e)
  }
})

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
  fetchAccounts()
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
          <p class="text-xs text-slate-400">Pusat kontrol aplikasi satelit, peran (roles), akun, dan penetapan akses</p>
        </div>
      </div>
      <NuxtLink
        to="/"
        class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        <span>Kembali ke Portal SSO</span>
      </NuxtLink>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <!-- Tabs Navigation -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'apps' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
          @click="activeTab = 'apps'"
        >
          <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
          <span>Kelola Aplikasi & Peran</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'accounts' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
          @click="activeTab = 'accounts'"
        >
          <UIcon name="i-lucide-users" class="w-4 h-4" />
          <span>Kelola Akun SSO</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'assign' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
          @click="activeTab = 'assign'"
        >
          <UIcon name="i-lucide-link" class="w-4 h-4" />
          <span>Hubungkan User ke Aplikasi</span>
        </button>
      </div>

      <!-- TAB 1: KELOLA APLIKASI -->
      <div v-if="activeTab === 'apps'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Form Add App -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">Daftarkan Aplikasi Baru</h3>
            <p class="text-xs text-slate-400">Hubungkan sistem satelit baru ke autentikasi SSO</p>
          </div>

          <form class="space-y-3.5" @submit.prevent="handleCreateApp">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">App ID (Kunci Unik)</label>
              <input
                v-model="newApp.app_id"
                placeholder="misal: kantor-virtual, helpdesk"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Nama Aplikasi</label>
              <input
                v-model="newApp.app_nama"
                placeholder="misal: Kantor Virtual Kepegawaian"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Deskripsi</label>
              <textarea
                v-model="newApp.app_deskripsi"
                placeholder="Keterangan singkat peran atau fungsi sistem ini..."
                rows="3"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none font-medium"
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
              <p class="text-xs text-slate-400">Atur peran aplikasi dan izin akses token SSO</p>
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

          <div v-if="apps.length === 0" class="py-8 text-center text-slate-400 text-xs">
            Belum ada aplikasi yang terdaftar. Silakan daftarkan aplikasi pertama Anda di sebelah kiri.
          </div>

          <div v-else class="divide-y divide-slate-100">
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

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  @click="openRolesModal(app)"
                >
                  <UIcon name="i-lucide-shield" class="w-3.5 h-3.5" />
                  <span>Kelola Role</span>
                </button>
                <button
                  type="button"
                  title="Hapus Aplikasi"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  @click="handleDeleteApp(app.app_id)"
                >
                  <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: KELOLA AKUN SSO -->
      <div v-if="activeTab === 'accounts'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Form Add Account -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">Tambah Akun Pegawai / User</h3>
            <p class="text-xs text-slate-400">Akun ini berlaku universal di semua aplikasi terhubung</p>
          </div>

          <form class="space-y-3.5" @submit.prevent="handleCreateAccount">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Username Login</label>
              <input
                v-model="newAccount.username"
                placeholder="misal: budi.santoso"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Password Awal</label>
              <input
                v-model="newAccount.password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
            </div>

            <div class="pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="newAccount.is_superadmin"
                  type="checkbox"
                  class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300"
                />
                <span class="text-xs text-slate-700 font-medium">Jadikan Superadmin SSO (Web Auth)</span>
              </label>
              <p class="text-[11px] text-slate-400 mt-1">Superadmin SSO dapat mendaftarkan aplikasi & mapping user di console ini.</p>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UIcon name="i-lucide-user-plus" class="w-4 h-4" />
              <span>Daftarkan Akun</span>
            </button>
          </form>
        </div>

        <!-- List Accounts -->
        <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Daftar Akun SSO ({{ accounts.length }})</h3>
              <p class="text-xs text-slate-400">Semua user yang memiliki kredensial login SSO terpusat</p>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              :class="{ 'animate-spin': isLoadingAccounts }"
              @click="fetchAccounts"
            >
              <UIcon name="i-lucide-rotate-cw" class="w-4 h-4" />
            </button>
          </div>

          <div v-if="accounts.length === 0" class="py-8 text-center text-slate-400 text-xs">
            Belum ada akun pengguna. Silakan daftarkan akun baru di sebelah kiri.
          </div>

          <div v-else class="divide-y divide-slate-100">
            <div v-for="acc in accounts" :key="acc.auth_id" class="py-3 flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">{{ acc.auth_username }}</span>
                  <span
                    v-if="acc.auth_is_superadmin"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Superadmin IAM
                  </span>
                </div>
                <p class="text-xs font-mono text-slate-400">ID: {{ acc.auth_id }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  v-if="acc.auth_username !== 'superadmin'"
                  type="button"
                  title="Hubungkan User ini ke Aplikasi"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  @click="newAssign.auth_id = acc.auth_id; activeTab = 'assign'"
                >
                  <UIcon name="i-lucide-link" class="w-4 h-4" />
                </button>
                <button
                  v-if="acc.auth_username !== 'superadmin'"
                  type="button"
                  title="Hapus Akun"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  @click="handleDeleteAccount(acc.auth_id, acc.auth_username)"
                >
                  <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: ASSIGN ACCESS -->
      <div v-if="activeTab === 'assign'" class="max-w-md mx-auto bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Tetapkan Hak Akses Aplikasi</h3>
          <p class="text-xs text-slate-400">Mapping user ke sistem yang diizinkan sesuai role yang tersedia</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleAssignAccess">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Pilih Akun / User</label>
            <select
              v-model="newAssign.auth_id"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="" disabled>-- Pilih Pengguna Pegawai --</option>
              <option
                v-for="acc in accounts.filter((a) => a.auth_username !== 'superadmin')"
                :key="acc.auth_id"
                :value="acc.auth_id"
              >
                {{ acc.auth_username }} ({{ acc.auth_id }})
              </option>
            </select>
            <p v-if="accounts.filter((a) => a.auth_username !== 'superadmin').length === 0" class="text-[11px] text-amber-600 mt-1">
              Belum ada akun pengguna pegawai selain superadmin. Buat akun baru di tab 'Kelola Akun SSO'.
            </p>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-600 uppercase">Pilih Aplikasi Target</label>
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
            <!-- Jika aplikasi memiliki role terdaftar, tampilkan dropdown -->
            <select
              v-if="availableRolesForAssign.length > 0"
              v-model="newAssign.app_role"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="" disabled>-- Pilih Role Terdaftar --</option>
              <option v-for="r in availableRolesForAssign" :key="r.role_id" :value="r.role_code">
                {{ r.role_nama }} ({{ r.role_code }})
              </option>
            </select>

            <!-- Jika belum ada role terdaftar, fallback text input dengan helper -->
            <div v-else>
              <input
                v-model="newAssign.app_role"
                placeholder="misal: SUPERADMIN, ADMIN, VIEWER"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
              <p class="text-[11px] text-slate-400 mt-1">
                Tip: Daftarkan role di tab 'Kelola Aplikasi' > 'Kelola Role' agar menjadi dropdown resmi.
              </p>
            </div>
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

      <!-- MODAL KELOLA ROLE PER APLIKASI -->
      <div
        v-if="selectedAppForRoles"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      >
        <div class="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 class="text-sm font-bold text-slate-900">
                Kelola Role: {{ selectedAppForRoles.app_nama }}
              </h3>
              <p class="text-xs text-slate-400 font-mono">App ID: {{ selectedAppForRoles.app_id }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              @click="selectedAppForRoles = null"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Form Tambah Role -->
            <form class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3" @submit.prevent="handleAddRole">
              <h4 class="text-xs font-bold text-slate-800">Tambah Role Baru untuk Aplikasi Ini</h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Kode Role (Kapital)</label>
                  <input
                    v-model="newRole.role_code"
                    placeholder="ADMIN_HR"
                    required
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono uppercase bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Nama Role</label>
                  <input
                    v-model="newRole.role_nama"
                    placeholder="Admin Personalia"
                    required
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase">Deskripsi (Opsional)</label>
                <input
                  v-model="newRole.role_deskripsi"
                  placeholder="Mengelola data struktur dan pegawai..."
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
                <span>Tambah Role</span>
              </button>
            </form>

            <!-- List Roles yang sudah ada -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700">Daftar Role Terdaftar ({{ appRoles.length }})</span>
                <span v-if="isLoadingRoles" class="text-xs text-slate-400">Memuat...</span>
              </div>

              <div v-if="appRoles.length === 0" class="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Belum ada role khusus yang didaftarkan untuk aplikasi ini.
              </div>

              <div v-else class="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                <div v-for="r in appRoles" :key="r.role_id" class="py-2.5 flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-xs text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{{ r.role_code }}</span>
                      <span class="text-xs font-medium text-slate-700">{{ r.role_nama }}</span>
                    </div>
                    <p v-if="r.role_deskripsi" class="text-[11px] text-slate-400 mt-0.5">{{ r.role_deskripsi }}</p>
                  </div>
                  <button
                    type="button"
                    class="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Role"
                    @click="handleDeleteRole(r.role_id, r.role_code)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
