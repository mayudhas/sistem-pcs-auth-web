<script setup lang="ts">
const props = defineProps<{
  account: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const authApi = '/api/auth-proxy'
const toast = useToast()

const form = reactive({
  new_password: '',
  confirm_password: ''
})
const isLoading = ref(false)

async function handleResetPassword() {
  if (form.new_password.length < 6) {
    toast.add({ title: 'Gagal', description: 'Password minimal 6 karakter', color: 'error' })
    return
  }
  if (form.new_password !== form.confirm_password) {
    toast.add({ title: 'Gagal', description: 'Konfirmasi password tidak cocok', color: 'error' })
    return
  }

  isLoading.value = true
  try {
    await $fetch(`${authApi}/auth/accounts/${props.account.auth_id}/reset-password`, {
      method: 'PATCH',
      body: {
        new_password: form.new_password
      }
    })
    toast.add({
      title: 'Sukses',
      description: `Password untuk user '${props.account.auth_username}' berhasil diperbarui!`,
      color: 'success'
    })
    emit('success')
    emit('close')
  } catch (err: any) {
    toast.add({
      title: 'Gagal',
      description: err?.data?.message || 'Gagal mengubah password',
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
            Ganti Password: {{ account.auth_username }}
          </h3>
          <p class="text-xs text-slate-400 font-mono">Auth ID: {{ account.auth_id }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleResetPassword">
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase">Password Baru</label>
          <input
            v-model="form.new_password"
            type="password"
            placeholder="Minimal 6 karakter"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase">Konfirmasi Password Baru</label>
          <input
            v-model="form.confirm_password"
            type="password"
            placeholder="Ulangi password baru"
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
            <UIcon v-else name="i-lucide-key-round" class="w-4 h-4" />
            <span>Simpan Password Baru</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
