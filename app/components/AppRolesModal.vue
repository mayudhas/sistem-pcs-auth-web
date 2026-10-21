<script setup lang="ts">
const props = defineProps<{
  app: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authApi = '/api/auth-proxy'
const toast = useToast()

const appRoles = ref<any[]>([])
const isLoadingRoles = ref(false)
const newRole = reactive({
  role_code: '',
  role_nama: '',
  role_deskripsi: ''
})

async function fetchAppRoles() {
  if (!props.app) return
  isLoadingRoles.value = true
  try {
    const res: any = await $fetch(`${authApi}/apps/${props.app.app_id}/roles`)
    appRoles.value = res.data || []
  } catch (err: any) {
    console.error(err)
  } finally {
    isLoadingRoles.value = false
  }
}

async function handleAddRole() {
  if (!props.app) return
  try {
    await $fetch(`${authApi}/apps/${props.app.app_id}/roles`, {
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
    await fetchAppRoles()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menambah role', color: 'error' })
  }
}

async function handleDeleteRole(roleId: string, roleCode: string) {
  if (!confirm(`Hapus role '${roleCode}' dari aplikasi ini?`)) return
  try {
    await $fetch(`${authApi}/apps/${props.app.app_id}/roles/${roleId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Role Dihapus', description: `Role ${roleCode} berhasil dihapus`, color: 'success' })
    await fetchAppRoles()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal menghapus role', color: 'error' })
  }
}

onMounted(() => {
  fetchAppRoles()
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 class="text-sm font-bold text-slate-900">
            Kelola Role: {{ app.app_nama }}
          </h3>
          <p class="text-xs text-slate-400 font-mono">App ID: {{ app.app_id }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          @click="emit('close')"
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
</template>
