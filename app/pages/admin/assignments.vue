<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const authApi = '/api/auth-proxy'
const toast = useToast()

const apps = ref<any[]>([])
const accounts = ref<any[]>([])
const appUsers = ref<any[]>([])
const availableRolesForAssign = ref<any[]>([])
const isLoadingAppUsers = ref(false)
const selectedAssignmentForEdit = ref<any>(null)

// Search & Pagination untuk Data Grid Pengguna per Aplikasi
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(6)

const newAssign = reactive({
  auth_id: (route.query.auth_id as string) || '',
  app_id: '',
  app_role: ''
})

async function fetchApps() {
  try {
    const res: any = await $fetch(`${authApi}/apps`)
    apps.value = res.data || []
  } catch (err: any) {
    console.error(err)
  }
}

async function fetchAccounts() {
  try {
    const res: any = await $fetch(`${authApi}/auth/accounts`)
    accounts.value = res.data || []
  } catch (err: any) {
    console.error(err)
  }
}

async function fetchAppUsers(appId: string) {
  if (!appId) {
    appUsers.value = []
    return
  }
  isLoadingAppUsers.value = true
  try {
    const res: any = await $fetch(`${authApi}/account-apps/app/${appId}`)
    appUsers.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingAppUsers.value = false
  }
}

const filteredAppUsers = computed(() => {
  return appUsers.value.filter((u) => {
    const username = u.account?.auth_username?.toLowerCase() || ''
    const role = u.app_role?.toLowerCase() || ''
    const q = searchQuery.value.toLowerCase()
    return username.includes(q) || role.includes(q)
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredAppUsers.value.length / pageSize.value))
})

const paginatedAppUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAppUsers.value.slice(start, start + pageSize.value)
})

watch(() => newAssign.app_id, async (appId) => {
  newAssign.app_role = ''
  availableRolesForAssign.value = []
  currentPage.value = 1
  if (!appId) return
  try {
    const res: any = await $fetch(`${authApi}/apps/${appId}/roles`)
    availableRolesForAssign.value = res.data || []
  } catch (e) {
    console.error(e)
  }
  await fetchAppUsers(appId)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

async function handleAssignAccess() {
  try {
    await $fetch(`${authApi}/account-apps/assign`, {
      method: 'POST',
      body: newAssign
    })
    toast.add({ title: 'Sukses', description: 'Hak akses aplikasi berhasil ditetapkan!', color: 'success' })
    const currentAppId = newAssign.app_id
    newAssign.auth_id = ''
    newAssign.app_role = ''
    await fetchAppUsers(currentAppId)
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menetapkan akses', color: 'error' })
  }
}

async function handleToggleAppActive(item: any) {
  try {
    const res: any = await $fetch(`${authApi}/account-apps/${item.account_app_id}/toggle-active`, {
      method: 'PATCH'
    })
    item.is_active = res.data.is_active
    toast.add({
      title: 'Status Akses Diperbarui',
      description: `Akses ${item.account?.auth_username} ${item.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      color: 'success'
    })
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mengubah status', color: 'error' })
  }
}

async function handleRevokeAccess(accountAppId: string, username: string) {
  if (!confirm(`Cabut hak akses untuk pengguna '${username}' dari aplikasi ini?`)) return
  try {
    await $fetch(`${authApi}/account-apps/${accountAppId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Akses Dicabut', description: `Akses ${username} berhasil dicabut`, color: 'success' })
    await fetchAppUsers(newAssign.app_id)
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mencabut akses', color: 'error' })
  }
}

onMounted(() => {
  fetchApps()
  fetchAccounts()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Form Mapping (4 Cols) -->
    <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-900">Tetapkan Hak Akses Aplikasi</h3>
        <p class="text-xs text-slate-400">Hubungkan user pegawai ke sistem yang diizinkan</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleAssignAccess">
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
          <label class="text-[11px] font-bold text-slate-600 uppercase">Pilih Akun Pegawai</label>
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
              {{ acc.auth_username }} (Status: {{ acc.auth_is_active ? 'Aktif' : 'Non-Aktif' }})
            </option>
          </select>
          <p v-if="accounts.filter((a) => a.auth_username !== 'superadmin').length === 0" class="text-[11px] text-amber-600 mt-1">
            Belum ada akun pegawai. Buat akun baru di menu 'Kelola Akun SSO'.
          </p>
        </div>

        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase">Role di Aplikasi Ini</label>
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

          <div v-else>
            <input
              v-model="newAssign.app_role"
              placeholder="misal: ADMIN, VIEWER"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
            />
            <p class="text-[11px] text-slate-400 mt-1">
              Tip: Daftarkan role di menu 'Kelola Aplikasi' > 'Kelola Role'.
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

    <!-- Data Grid Pengguna per Aplikasi (8 Cols) -->
    <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between min-h-[520px]">
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900">
              Pengguna Terdaftar di Aplikasi
              <span v-if="newAssign.app_id" class="text-blue-600 font-mono">({{ newAssign.app_id }})</span>
            </h3>
            <p class="text-xs text-slate-400">Daftar pegawai yang memiliki izin akses masuk ke aplikasi ini</p>
          </div>
          <button
            v-if="newAssign.app_id"
            type="button"
            class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors self-end sm:self-auto cursor-pointer"
            :class="{ 'animate-spin': isLoadingAppUsers }"
            title="Muat Ulang"
            @click="fetchAppUsers(newAssign.app_id)"
          >
            <UIcon name="i-lucide-rotate-cw" class="w-4 h-4" />
          </button>
        </div>

        <!-- Search Bar -->
        <div v-if="newAssign.app_id && appUsers.length > 0" class="relative">
          <UIcon name="i-lucide-search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            placeholder="Cari pengguna berdasarkan username atau role..."
            class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium bg-slate-50/50"
          />
        </div>

        <!-- Empty states -->
        <div v-if="!newAssign.app_id" class="py-16 text-center text-slate-400 text-xs">
          Pilih aplikasi di formulir sebelah kiri untuk melihat data grid pengguna.
        </div>

        <div v-else-if="isLoadingAppUsers" class="py-16 text-center text-slate-400 text-xs">
          Memuat daftar pengguna aplikasi...
        </div>

        <div v-else-if="appUsers.length === 0" class="py-16 text-center text-slate-400 text-xs">
          Belum ada pengguna pegawai yang di-mapping ke aplikasi ini.
        </div>

        <!-- Data Grid Table -->
        <div v-else class="border border-slate-200 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-3 px-4">Pengguna</th>
                  <th class="py-3 px-4">Role Aplikasi</th>
                  <th class="py-3 px-4">Akses Aplikasi</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-if="paginatedAppUsers.length === 0">
                  <td colspan="4" class="py-8 text-center text-slate-400">
                    Tidak ditemukan pengguna yang cocok dengan pencarian.
                  </td>
                </tr>

                <tr
                  v-for="item in paginatedAppUsers"
                  :key="item.account_app_id"
                  class="hover:bg-slate-50/80 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900">{{ item.account?.auth_username || 'User' }}</span>
                      <span class="font-mono text-[10px] text-slate-400">ID: {{ item.auth_id }}</span>
                    </div>
                  </td>

                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {{ item.app_role }}
                    </span>
                  </td>

                  <td class="py-3 px-4">
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
                      :class="item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'"
                      @click="handleToggleAppActive(item)"
                    >
                      {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
                    </button>
                  </td>

                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="Ubah Role di Aplikasi Ini"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        @click="selectedAssignmentForEdit = item"
                      >
                        <UIcon name="i-lucide-pencil" class="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title="Cabut Akses Pengguna"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        @click="handleRevokeAccess(item.account_app_id, item.account?.auth_username)"
                      >
                        <UIcon name="i-lucide-user-x" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="newAssign.app_id && appUsers.length > 0" class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-bold text-slate-700">{{ filteredAppUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }}</span> - 
          <span class="font-bold text-slate-700">{{ Math.min(currentPage * pageSize, filteredAppUsers.length) }}</span> dari 
          <span class="font-bold text-slate-700">{{ filteredAppUsers.length }}</span> pengguna
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
            @click="currentPage--"
          >
            Sebelumnya
          </button>
          <span class="px-2 text-slate-600 font-semibold">{{ currentPage }} / {{ totalPages }}</span>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
            @click="currentPage++"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Role Pengguna -->
    <EditAssignmentRoleModal
      v-if="selectedAssignmentForEdit"
      :assignment="selectedAssignmentForEdit"
      :available-roles="availableRolesForAssign"
      @close="selectedAssignmentForEdit = null"
      @success="fetchAppUsers(newAssign.app_id)"
    />
  </div>
</template>
