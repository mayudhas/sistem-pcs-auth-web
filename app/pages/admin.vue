<script setup lang="ts">
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
  password: ''
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
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary">
            <UIcon name="i-lucide-shield-alert" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">IAM Management Console</h1>
            <p class="text-xs text-neutral-500">Pusat Pengelolaan Akun, Aplikasi & Hak Akses Terpusat</p>
          </div>
        </div>
        <UButton to="/" variant="ghost" color="neutral" icon="i-lucide-arrow-left">
          Kembali ke Login
        </UButton>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <UButton
          :variant="activeTab === 'apps' ? 'solid' : 'ghost'"
          color="primary"
          icon="i-lucide-layout-grid"
          @click="activeTab = 'apps'"
        >
          Daftar Client Apps
        </UButton>
        <UButton
          :variant="activeTab === 'accounts' ? 'solid' : 'ghost'"
          color="primary"
          icon="i-lucide-users"
          @click="activeTab = 'accounts'"
        >
          Kelola Akun
        </UButton>
        <UButton
          :variant="activeTab === 'assign' ? 'solid' : 'ghost'"
          color="primary"
          icon="i-lucide-key"
          @click="activeTab = 'assign'"
        >
          Penugasan Hak Akses
        </UButton>
      </div>

      <!-- Tab: Client Apps -->
      <div v-if="activeTab === 'apps'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard class="md:col-span-1 shadow-sm">
          <template #header>
            <h3 class="font-semibold text-sm">Daftarkan Client App Baru</h3>
          </template>
          <form class="space-y-3" @submit.prevent="handleCreateApp">
            <UFormField label="App ID (Kebab-case)">
              <UInput v-model="newApp.app_id" placeholder="contoh: app-payroll" required />
            </UFormField>
            <UFormField label="Nama Aplikasi">
              <UInput v-model="newApp.app_nama" placeholder="contoh: Sistem Penggajian" required />
            </UFormField>
            <UFormField label="Deskripsi (Opsional)">
              <UTextarea v-model="newApp.app_deskripsi" placeholder="Keterangan singkat aplikasi..." />
            </UFormField>
            <UButton type="submit" block size="sm" icon="i-lucide-plus">
              Daftarkan App
            </UButton>
          </form>
        </UCard>

        <UCard class="md:col-span-2 shadow-sm">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold text-sm">Aplikasi yang Terhubung ({{ apps.length }})</h3>
              <UButton size="xs" variant="ghost" icon="i-lucide-refresh-cw" :loading="isLoadingApps" @click="fetchApps" />
            </div>
          </template>

          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <div v-for="app in apps" :key="app.app_id" class="py-3 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{{ app.app_nama }}</span>
                  <span class="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {{ app.app_id }}
                  </span>
                </div>
                <p class="text-xs text-neutral-500 mt-0.5">{{ app.app_deskripsi || 'Tidak ada deskripsi' }}</p>
              </div>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="app.app_is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
              >
                {{ app.app_is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Tab: Accounts -->
      <div v-if="activeTab === 'accounts'" class="max-w-md mx-auto">
        <UCard class="shadow-sm">
          <template #header>
            <h3 class="font-semibold text-sm">Buat Akun Kredensial Baru</h3>
          </template>
          <form class="space-y-4" @submit.prevent="handleCreateAccount">
            <UFormField label="Username">
              <UInput v-model="newAccount.username" placeholder="contoh: budi_santoso" required icon="i-lucide-user" />
            </UFormField>
            <UFormField label="Password Awal">
              <UInput v-model="newAccount.password" type="password" placeholder="minimal 6 karakter" required icon="i-lucide-lock" />
            </UFormField>
            <UButton type="submit" block size="sm" icon="i-lucide-user-plus">
              Simpan Akun
            </UButton>
          </form>
        </UCard>
      </div>

      <!-- Tab: Assign Access -->
      <div v-if="activeTab === 'assign'" class="max-w-md mx-auto">
        <UCard class="shadow-sm">
          <template #header>
            <h3 class="font-semibold text-sm">Tetapkan Hak Akses & Role per Aplikasi</h3>
          </template>
          <form class="space-y-4" @submit.prevent="handleAssignAccess">
            <UFormField label="Auth ID (UUID User)">
              <UInput v-model="newAssign.auth_id" placeholder="01a15c..." required font-mono text-xs />
            </UFormField>
            <UFormField label="Pilih Aplikasi Target">
              <USelect
                v-model="newAssign.app_id"
                :items="apps.map(a => ({ label: `${a.app_nama} (${a.app_id})`, value: a.app_id }))"
                required
              />
            </UFormField>
            <UFormField label="Role di Aplikasi Ini">
              <UInput v-model="newAssign.app_role" placeholder="contoh: SUPERADMIN, ADMIN, VIEWER" required />
            </UFormField>
            <UButton type="submit" block size="sm" icon="i-lucide-check">
              Tetapkan Hak Akses
            </UButton>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>
