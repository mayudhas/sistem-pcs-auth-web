<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Navbar Header -->
    <header class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div class="flex items-center gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs">
          <UIcon name="i-lucide-shield-alert" class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold text-slate-900 tracking-tight">IAM Management Console</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Khusus Superadmin SSO
            </span>
          </div>
          <p class="text-xs text-slate-400">Pusat kontrol aplikasi satelit, peran (roles), akun, dan penetapan akses</p>
        </div>
      </div>
      <NuxtLink
        to="/"
        class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        <span>Kembali ke Portal SSO</span>
      </NuxtLink>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <!-- Tabs Navigation -->
      <AdminNavTabs />

      <!-- Page Content Slot -->
      <slot />
    </div>
  </div>
</template>
