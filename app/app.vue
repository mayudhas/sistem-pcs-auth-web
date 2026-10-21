<script setup>
useHead({
  title: 'PCS Single Sign-On & IAM Portal',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

// Paksa light mode agar bersih, cerah, ramah mata dan tidak hitam
const colorMode = useColorMode()
colorMode.preference = 'light'
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-blue-100 selection:text-blue-900">
      <NuxtPage />
    </div>
  </UApp>
</template>
