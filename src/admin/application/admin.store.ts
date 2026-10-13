import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/security/domain/model/user.entity'
import { UserAssembler } from '@/security/infrastructure/user.assembler'
import { adminApi } from '@/admin/infrastructure/admin.api'

export interface PlatformStats {
  users: number
  recipes: number
  stores: number
  products: number
}

export const useAdminStore = defineStore('admin', () => {
  const stats = ref<PlatformStats | null>(null)
  const users = ref<User[]>([])
  const totalUsers = ref(0)
  const loadingUsers = ref(false)

  async function loadStats(): Promise<void> {
    const [u, r, s, p] = await Promise.all([
      adminApi.count('/users'),
      adminApi.count('/recipes'),
      adminApi.count('/stores'),
      adminApi.count('/products'),
    ])
    stats.value = { users: u, recipes: r, stores: s, products: p }
  }

  async function loadUsers(page: number, pageSize: number): Promise<void> {
    loadingUsers.value = true
    try {
      const result = await adminApi.listUsers(page, pageSize)
      users.value = result.items.map(UserAssembler.toEntity)
      totalUsers.value = result.totalItems
    } finally {
      loadingUsers.value = false
    }
  }

  async function getUser(id: number): Promise<User> {
    return UserAssembler.toEntity(await adminApi.getUser(id))
  }

  async function deleteUser(id: number): Promise<void> {
    await adminApi.deleteUser(id)
    users.value = users.value.filter((u) => u.id !== id)
    totalUsers.value = Math.max(0, totalUsers.value - 1)
    if (stats.value) stats.value = { ...stats.value, users: Math.max(0, stats.value.users - 1) }
  }

  function $reset() {
    stats.value = null
    users.value = []
    totalUsers.value = 0
  }

  return {
    stats,
    users,
    totalUsers,
    loadingUsers,
    loadStats,
    loadUsers,
    getUser,
    deleteUser,
    $reset,
  }
})
