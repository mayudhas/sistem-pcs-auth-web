<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const authApi = '/api/auth-proxy'
const toast = useToast()

const accounts = ref<any[]>([])
const isLoadingAccounts = ref(false)

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

onMounted(() => {
  fetchAccounts()
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <NuxtLink
              v-if="acc.auth_username !== 'superadmin'"
              :to="{ path: '/admin/assignments', query: { auth_id: acc.auth_id } }"
              title="Hubungkan User ini ke Aplikasi"
              class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <UIcon name="i-lucide-link" class="w-4 h-4" />
            </NuxtLink>
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
</template>
