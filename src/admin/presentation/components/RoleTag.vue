<script setup lang="ts">
import Tag from 'primevue/tag'
import { ROLE_LABELS, type Role } from '@/security/domain/model/role'

defineProps<{ role: Role }>()

const SEVERITY: Record<Role, 'info' | 'warn' | 'danger'> = {
  Customer: 'info',
  StoreOwner: 'warn',
  Admin: 'danger',
}
</script>

<template>
  <Tag :value="ROLE_LABELS[role]" :severity="SEVERITY[role]" rounded />
</template>
