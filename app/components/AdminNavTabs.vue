<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
    <NuxtLink
      to="/admin/apps"
      class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
      :class="route.path === '/admin/apps' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
    >
      <UIcon name="i-lucide-layout-grid" class="w-4 h-4" />
      <span>Kelola Aplikasi & Peran</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/accounts"
      class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
      :class="route.path === '/admin/accounts' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
    >
      <UIcon name="i-lucide-users" class="w-4 h-4" />
      <span>Kelola Akun SSO</span>
    </NuxtLink>

    <NuxtLink
      to="/admin/assignments"
      class="px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
      :class="route.path === '/admin/assignments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'"
    >
      <UIcon name="i-lucide-link" class="w-4 h-4" />
      <span>Hubungkan User ke Aplikasi</span>
    </NuxtLink>
  </div>
</template>
