import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '~/store/useAuthStore'
import { useNavigate } from 'react-router'
import { getQueryClient } from '~/lib/queryClient'

export const useLogoutMutation = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = getQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Отправляем запрос на сервер для удаления cookie
      const res = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Ошибка при выходе')
      }

      return res.json()
    },
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate('/auth')
    },
    onError: () => {
      // Даже если сервер не ответил — разлогиниваем локально
      logout()
      queryClient.clear()
      navigate('/auth')
    },
  })
}
