<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const authApi = '/api/auth-proxy'
const toast = useToast()

const apps = ref<any[]>([])
const isLoadingApps = ref(false)
const selectedAppForRoles = ref<any>(null)

const newApp = reactive({
  app_id: '',
  app_nama: '',
  app_deskripsi: ''
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

onMounted(() => {
  fetchApps()
})
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                @click="selectedAppForRoles = app"
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

    <!-- Modal Roles -->
    <AppRolesModal
      v-if="selectedAppForRoles"
      :app="selectedAppForRoles"
      @close="selectedAppForRoles = null"
    />
  </div>
</template>
