<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { expirationLabel, expirationStatus, type Supply } from '@/pantry/domain/model/supply.entity'

const props = defineProps<{ supply: Pick<Supply, 'expiresOn'> }>()

const SEVERITY = { expired: 'danger', soon: 'warn', ok: 'success', none: 'secondary' } as const
const ICON = {
  expired: 'pi pi-times-circle',
  soon: 'pi pi-exclamation-triangle',
  ok: 'pi pi-check-circle',
  none: 'pi pi-minus-circle',
} as const

const status = computed(() => expirationStatus(props.supply))
</script>

<template>
  <Tag :severity="SEVERITY[status]" :icon="ICON[status]" :value="expirationLabel(supply)" rounded />
</template>
