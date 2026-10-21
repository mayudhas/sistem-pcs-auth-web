<script setup lang="ts">
const config = useRuntimeConfig()
const authApi = config.public.authApiBase

const form = reactive({
  username: '',
  password: '',
  app_id: 'sistem-pcs'
})

const isLoading = ref(false)
const errorMessage = ref('')
const loginSuccessData = ref<any>(null)

const toast = useToast()

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res: any = await $fetch(`${authApi}/auth/login`, {
      method: 'POST',
      body: form
    })

    loginSuccessData.value = res.data
    localStorage.setItem('sso_access_token', res.data.access_token)
    localStorage.setItem('sso_refresh_token', res.data.refresh_token)
    localStorage.setItem('sso_user', JSON.stringify(res.data.user))

    toast.add({
      title: 'Login Berhasil',
      description: `Selamat datang, ${res.data.user.username}!`,
      color: 'success'
    })
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Login gagal, periksa kredensial Anda.'
    toast.add({
      title: 'Login Gagal',
      description: errorMessage.value,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
    <UCard class="w-full max-w-md shadow-xl border border-neutral-200 dark:border-neutral-800">
      <template #header>
        <div class="text-center space-y-1">
          <div class="inline-flex p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary mb-2">
            <UIcon name="i-lucide-shield-check" class="w-8 h-8" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            PCS Single Sign-On
          </h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Satu Akun untuk Seluruh Ekosistem Aplikasi
          </p>
        </div>
      </template>

      <div v-if="!loginSuccessData">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          :title="errorMessage"
          icon="i-lucide-alert-circle"
          class="mb-4"
        />

        <form class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Username" name="username">
            <UInput
              v-model="form.username"
              placeholder="Contoh: superadmin"
              icon="i-lucide-user"
              autofocus
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Target Aplikasi" name="app_id">
            <USelect
              v-model="form.app_id"
              :items="[
                { label: 'Sistem PCS (Struktur Organisasi)', value: 'sistem-pcs' },
                { label: 'Aplikasi Absensi (Simulasi)', value: 'app-absensi' }
              ]"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="isLoading"
            icon="i-lucide-log-in"
            class="mt-2"
          >
            Masuk ke Sistem
          </UButton>
        </form>
      </div>

      <div v-else class="space-y-4 text-center py-2">
        <UIcon name="i-lucide-check-circle-2" class="w-16 h-16 text-success mx-auto" />
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Autentikasi Terverifikasi!
        </h3>
        <p class="text-sm text-neutral-500">
          Role Anda di <b>{{ loginSuccessData.user.app_id }}</b>:
          <span class="inline-flex px-2 py-0.5 rounded font-mono text-xs font-semibold bg-primary/10 text-primary">
            {{ loginSuccessData.user.app_role }}
          </span>
        </p>

        <div class="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-left text-xs font-mono break-all text-neutral-600 dark:text-neutral-400 max-h-36 overflow-y-auto">
          {{ loginSuccessData.access_token }}
        </div>

        <div class="flex gap-2 pt-2">
          <UButton
            to="/admin"
            variant="solid"
            color="primary"
            block
            icon="i-lucide-settings"
          >
            Buka IAM Console
          </UButton>
          <UButton
            variant="outline"
            color="neutral"
            block
            @click="loginSuccessData = null"
          >
            Logout
          </UButton>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center text-xs text-neutral-400">
          <span>SSO Engine: RS256 Asymmetric</span>
          <NuxtLink to="/admin" class="hover:underline text-primary">
            Admin Console →
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </div>
</template>
