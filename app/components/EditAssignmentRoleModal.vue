<script setup lang="ts">
const props = defineProps<{
  assignment: any
  availableRoles: any[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const authApi = '/api/auth-proxy'
const toast = useToast()

const selectedRole = ref(props.assignment.app_role)
const isLoading = ref(false)

async function handleUpdateRole() {
  if (!selectedRole.value) {
    toast.add({ title: 'Gagal', description: 'Pilih role yang ingin ditetapkan', color: 'error' })
    return
  }

  isLoading.value = true
  try {
    await $fetch(`${authApi}/account-apps/${props.assignment.account_app_id}/role`, {
      method: 'PATCH',
      body: {
        app_role: selectedRole.value
      }
    })
    toast.add({
      title: 'Sukses',
      description: `Role pengguna '${props.assignment.account?.auth_username}' berhasil diubah menjadi '${selectedRole.value}'!`,
      color: 'success'
    })
    emit('success')
    emit('close')
  } catch (err: any) {
    toast.add({
      title: 'Gagal',
      description: err?.data?.message || 'Gagal mengubah role',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
    <div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 class="text-sm font-bold text-slate-900">
            Ubah Role: {{ assignment.account?.auth_username }}
          </h3>
          <p class="text-xs text-slate-400 font-mono">Aplikasi: {{ assignment.app_id }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleUpdateRole">
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase">Pilih Role Baru</label>
          <select
            v-if="availableRoles.length > 0"
            v-model="selectedRole"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
          >
            <option value="" disabled>-- Pilih Role Terdaftar --</option>
            <option v-for="r in availableRoles" :key="r.role_id" :value="r.role_code">
              {{ r.role_nama }} ({{ r.role_code }})
            </option>
          </select>
          <input
            v-else
            v-model="selectedRole"
            placeholder="misal: ADMIN, VIEWER"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <UIcon v-if="isLoading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-lucide-check-circle" class="w-4 h-4" />
            <span>Simpan Perubahan Role</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
