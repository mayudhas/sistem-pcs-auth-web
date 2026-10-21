<script setup lang="ts">
const props = defineProps<{
  account: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const authApi = '/api/auth-proxy'
const toast = useToast()

const userApps = ref<any[]>([])
const isLoading = ref(false)
const selectedAssignmentForEdit = ref<any>(null)
const availableRoles = ref<any[]>([])

async function fetchUserApps() {
  if (!props.account) return
  isLoading.value = true
  try {
    const res: any = await $fetch(`${authApi}/account-apps/user/${props.account.auth_id}`)
    userApps.value = res.data || []
  } catch (err: any) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function handleToggleAccountActive() {
  if (props.account.auth_username === 'superadmin') {
    alert('Akun superadmin utama tidak boleh dinonaktifkan!')
    return
  }
  const actionText = props.account.auth_is_active ? 'menonaktifkan' : 'mengaktifkan'
  const warningText = props.account.auth_is_active
    ? ' Seluruh akses login SSO dan semua aplikasi yang dipegang akan ikut non-aktif!'
    : ''

  if (!confirm(`Yakin ingin ${actionText} akun '${props.account.auth_username}'?${warningText}`)) return

  try {
    const res: any = await $fetch(`${authApi}/auth/accounts/${props.account.auth_id}/toggle-active`, {
      method: 'PATCH'
    })
    props.account.auth_is_active = res.data.auth_is_active
    toast.add({
      title: 'Status Berubah',
      description: `Akun ${props.account.auth_username} ${res.data.auth_is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      color: 'success'
    })
    emit('refresh')
    await fetchUserApps()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mengubah status', color: 'error' })
  }
}

async function handleToggleAppActive(assignment: any) {
  try {
    const res: any = await $fetch(`${authApi}/account-apps/${assignment.account_app_id}/toggle-active`, {
      method: 'PATCH'
    })
    assignment.is_active = res.data.is_active
    toast.add({
      title: 'Status Akses Diperbarui',
      description: `Akses pada ${assignment.app?.app_nama || assignment.app_id} ${assignment.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      color: 'success'
    })
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mengubah status akses', color: 'error' })
  }
}

async function handleRevokeApp(assignment: any) {
  if (!confirm(`Cabut akses ${props.account.auth_username} dari aplikasi '${assignment.app?.app_nama || assignment.app_id}'?`)) return
  try {
    await $fetch(`${authApi}/account-apps/${assignment.account_app_id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Akses Dicabut', description: 'Hak akses berhasil dicabut', color: 'success' })
    await fetchUserApps()
  } catch (err: any) {
    toast.add({ title: 'Gagal', description: err?.data?.message || 'Gagal mencabut akses', color: 'error' })
  }
}

async function openEditRoleModal(assignment: any) {
  try {
    const res: any = await $fetch(`${authApi}/apps/${assignment.app_id}/roles`)
    availableRoles.value = res.data || []
  } catch (e) {
    availableRoles.value = []
  }
  selectedAssignmentForEdit.value = assignment
}

onMounted(() => {
  fetchUserApps()
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-slate-900">
              Detail Pengguna: {{ account.auth_username }}
            </h3>
            <span
              v-if="account.auth_is_superadmin"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Superadmin IAM
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">Auth ID: {{ account.auth_id }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <!-- Status Akun Global SSO & Toggle -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-700">Status Akun Global SSO:</span>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-bold"
                :class="account.auth_is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
              >
                {{ account.auth_is_active ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Jika non-aktif, user tidak dapat login ke portal SSO maupun aplikasi satelit manapun.
            </p>
          </div>

          <button
            v-if="account.auth_username !== 'superadmin'"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            :class="account.auth_is_active ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
            @click="handleToggleAccountActive"
          >
            {{ account.auth_is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun' }}
          </button>
        </div>

        <!-- List Aplikasi yang Dipegang -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aplikasi yang Dihubungkan ({{ userApps.length }})
            </h4>
            <span v-if="isLoading" class="text-xs text-slate-400">Memuat...</span>
          </div>

          <div v-if="userApps.length === 0" class="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            Pengguna ini belum di-mapping ke aplikasi manapun.
          </div>

          <div v-else class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div
              v-for="appRel in userApps"
              :key="appRel.account_app_id"
              class="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900">{{ appRel.app?.app_nama || appRel.app_id }}</span>
                  <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {{ appRel.app_id }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {{ appRel.app_role }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-slate-400">Status Akses:</span>
                  <span
                    class="font-semibold"
                    :class="appRel.is_active ? 'text-emerald-600' : 'text-slate-400'"
                  >
                    {{ appRel.is_active ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Toggle Active per App -->
                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors"
                  :class="appRel.is_active ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'"
                  @click="handleToggleAppActive(appRel)"
                >
                  {{ appRel.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>

                <!-- Edit Role Button -->
                <button
                  type="button"
                  title="Ubah Role di Aplikasi Ini"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  @click="openEditRoleModal(appRel)"
                >
                  <UIcon name="i-lucide-pencil" class="w-4 h-4" />
                </button>

                <!-- Revoke Button -->
                <button
                  type="button"
                  title="Cabut Akses dari Aplikasi Ini"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  @click="handleRevokeApp(appRel)"
                >
                  <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submodal Edit Role -->
    <EditAssignmentRoleModal
      v-if="selectedAssignmentForEdit"
      :assignment="selectedAssignmentForEdit"
      :available-roles="availableRoles"
      @close="selectedAssignmentForEdit = null"
      @success="fetchUserApps"
    />
  </div>
</template>
