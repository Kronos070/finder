import { useMutation } from '@tanstack/react-query'
import { client } from '../lib/api'
import type { CredentialsI } from '~/types/types'
import { useAuthStore } from '~/store/useAuthStore'
import { useNavigate } from 'react-router'
import { getQueryClient } from '~/lib/queryClient'

interface LoginError {
  error: string
}

export const useLoginMutation = () => {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = getQueryClient()

  return useMutation({
    mutationFn: async (credentials: CredentialsI) => {
      const res = await client.api.login.$post({
        json: credentials,
      })

      if (!res.ok) {
        const errorData = (await res.json()) as LoginError
        throw new Error(errorData.error || 'Ошибка входа')
      }

      return res.json()
    },
    onSuccess: async () => {
      // После логина загружаем профиль пользователя, чтобы получить данные
      try {
        const profileRes = await client.api.profile.$get()
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUser({ name: profileData.name, role: 'user' })
        }
      } catch {
        // Даже если профиль не загрузился, логин прошёл — ставим базовые данные
        setUser({ name: 'User', role: 'user' })
      }

      // Инвалидируем все закэшированные запросы
      queryClient.invalidateQueries()

      navigate('/')
    },
    onError: (error: Error) => {
      console.error('Ошибка входа:', error.message)
      // Ошибка будет доступна через mutation.error в компоненте
    },
  })
}