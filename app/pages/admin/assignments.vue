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
  await fetchAppUsers(appId)
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
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Form Mapping -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
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
              {{ acc.auth_username }}
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

    <!-- List Users Per App -->
    <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
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
          class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          :class="{ 'animate-spin': isLoadingAppUsers }"
          @click="fetchAppUsers(newAssign.app_id)"
        >
          <UIcon name="i-lucide-rotate-cw" class="w-4 h-4" />
        </button>
      </div>

      <div v-if="!newAssign.app_id" class="py-12 text-center text-slate-400 text-xs">
        Pilih aplikasi di formulir sebelah kiri untuk melihat daftar pengguna yang terhubung.
      </div>

      <div v-else-if="isLoadingAppUsers" class="py-12 text-center text-slate-400 text-xs">
        Memuat daftar pengguna aplikasi...
      </div>

      <div v-else-if="appUsers.length === 0" class="py-12 text-center text-slate-400 text-xs">
        Belum ada pengguna pegawai yang di-mapping ke aplikasi ini.
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="item in appUsers"
          :key="item.account_app_id"
          class="py-3 flex items-center justify-between"
        >
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-slate-900">{{ item.account?.auth_username || 'User' }}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {{ item.app_role }}
              </span>
            </div>
            <p class="text-xs font-mono text-slate-400">Auth ID: {{ item.auth_id }}</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              title="Ubah Role"
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
