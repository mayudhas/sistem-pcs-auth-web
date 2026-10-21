<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const authApi = '/api/auth-proxy'
const toast = useToast()

const accounts = ref<any[]>([])
const isLoadingAccounts = ref(false)
const selectedAccountForPassword = ref<any>(null)
const selectedAccountForDetail = ref<any>(null)

// Filtering & Pagination
const searchQuery = ref('')
const filterStatus = ref('ALL') // ALL, ACTIVE, INACTIVE
const currentPage = ref(1)
const pageSize = ref(8)

const newAccount = reactive({
  username: '',
  password: '',
  is_superadmin: false
})

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

const filteredAccounts = computed(() => {
  return accounts.value.filter((acc) => {
    const matchSearch =
      acc.auth_username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      acc.auth_id.toLowerCase().includes(searchQuery.value.toLowerCase())

    if (filterStatus.value === 'ACTIVE') return matchSearch && acc.auth_is_active
    if (filterStatus.value === 'INACTIVE') return matchSearch && !acc.auth_is_active
    return matchSearch
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredAccounts.value.length / pageSize.value))
})

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAccounts.value.slice(start, start + pageSize.value)
})

watch([searchQuery, filterStatus], () => {
  currentPage.value = 1
})

async function handleCreateAccount() {
  try {
    const res: any = await $fetch(`${authApi}/auth/accounts`, {
      method: 'POST',
      body: newAccount
    })
    toast.add({
      title: 'Akun Terdaftar',
      description: `User '${res.data.auth_username}' berhasil dibuat.`,
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

async function handleToggleStatus(acc: any) {
  if (acc.auth_username === 'superadmin') {
    alert('Akun superadmin utama tidak boleh dinonaktifkan!')
    return
  }
  const actionText = acc.auth_is_active ? 'menonaktifkan' : 'mengaktifkan'
  const warningText = acc.auth_is_active
    ? ' Seluruh akses login SSO dan seluruh aplikasi yang dipegang akan ikut non-aktif!'
    : ''

  if (!confirm(`Yakin ingin ${actionText} akun '${acc.auth_username}'?${warningText}`)) return

  try {
    const res: any = await $fetch(`${authApi}/auth/accounts/${acc.auth_id}/toggle-active`, {
      method: 'PATCH'
    })
    acc.auth_is_active = res.data.auth_is_active
    toast.add({
      title: 'Status Diperbarui',
      description: `Akun ${acc.auth_username} ${acc.auth_is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      color: 'success'
    })
    await fetchAccounts()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mengubah status', color: 'error' })
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

onMounted(() => {
  fetchAccounts()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Form Add Account (Kiri, 4 Cols) -->
    <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
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

    <!-- Data Grid / Table Accounts (Kanan, 8 Cols) -->
    <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between min-h-[520px]">
      <div class="space-y-4">
        <!-- Table Header & Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Daftar Akun SSO ({{ accounts.length }})</h3>
            <p class="text-xs text-slate-400">Kelola status aktif/non-aktif, kredensial, dan hak akses aplikasi</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors self-end sm:self-auto cursor-pointer"
            :class="{ 'animate-spin': isLoadingAccounts }"
            title="Muat Ulang"
            @click="fetchAccounts"
          >
            <UIcon name="i-lucide-rotate-cw" class="w-4 h-4" />
          </button>
        </div>

        <!-- Filter & Search Bar -->
        <div class="flex flex-col sm:flex-row items-center gap-2.5">
          <div class="relative w-full sm:flex-1">
            <UIcon name="i-lucide-search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              placeholder="Cari berdasarkan username atau Auth ID..."
              class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium bg-slate-50/50"
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="filterStatus"
              class="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Hanya Aktif</option>
              <option value="INACTIVE">Hanya Non-Aktif</option>
            </select>
          </div>
        </div>

        <!-- Data Grid Table -->
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-3 px-4">Pengguna</th>
                  <th class="py-3 px-4">Status SSO</th>
                  <th class="py-3 px-4">Tipe Akun</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr v-if="paginatedAccounts.length === 0">
                  <td colspan="4" class="py-10 text-center text-slate-400">
                    Tidak ada akun yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>

                <tr
                  v-for="acc in paginatedAccounts"
                  :key="acc.auth_id"
                  class="hover:bg-slate-50/80 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900">{{ acc.auth_username }}</span>
                      <span class="font-mono text-[10px] text-slate-400">ID: {{ acc.auth_id }}</span>
                    </div>
                  </td>

                  <td class="py-3 px-4">
                    <button
                      type="button"
                      :disabled="acc.auth_username === 'superadmin'"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
                      :class="acc.auth_is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'"
                      @click="handleToggleStatus(acc)"
                    >
                      {{ acc.auth_is_active ? 'Aktif' : 'Non-Aktif' }}
                    </button>
                  </td>

                  <td class="py-3 px-4">
                    <span
                      v-if="acc.auth_is_superadmin"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                    >
                      Superadmin IAM
                    </span>
                    <span v-else class="text-slate-500 text-xs">
                      Pegawai / User
                    </span>
                  </td>

                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Detail User & Apps Modal Trigger -->
                      <button
                        type="button"
                        title="Lihat Detail & Aplikasi Pegangan"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        @click="selectedAccountForDetail = acc"
                      >
                        <UIcon name="i-lucide-eye" class="w-4 h-4" />
                      </button>

                      <!-- Change Password Trigger -->
                      <button
                        type="button"
                        title="Ganti Password"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        @click="selectedAccountForPassword = acc"
                      >
                        <UIcon name="i-lucide-key-round" class="w-4 h-4" />
                      </button>

                      <!-- Direct Link to Assign Page -->
                      <NuxtLink
                        v-if="acc.auth_username !== 'superadmin'"
                        :to="{ path: '/admin/assignments', query: { auth_id: acc.auth_id } }"
                        title="Petakan ke Aplikasi Baru"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <UIcon name="i-lucide-link" class="w-4 h-4" />
                      </NuxtLink>

                      <!-- Delete Account -->
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-bold text-slate-700">{{ filteredAccounts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }}</span> - 
          <span class="font-bold text-slate-700">{{ Math.min(currentPage * pageSize, filteredAccounts.length) }}</span> dari 
          <span class="font-bold text-slate-700">{{ filteredAccounts.length }}</span> pengguna
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

    <!-- Modal Ganti Password -->
    <ChangePasswordModal
      v-if="selectedAccountForPassword"
      :account="selectedAccountForPassword"
      @close="selectedAccountForPassword = null"
      @success="fetchAccounts"
    />

    <!-- Modal Detail Pengguna & App Relasi -->
    <UserDetailModal
      v-if="selectedAccountForDetail"
      :account="selectedAccountForDetail"
      @close="selectedAccountForDetail = null"
      @refresh="fetchAccounts"
    />
  </div>
</template>
