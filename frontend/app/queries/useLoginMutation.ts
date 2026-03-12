import { useMutation } from '@tanstack/react-query'
import { client } from '../lib/api'
import type { CredentialsI } from '~/types/types'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (credentials: CredentialsI) => {
      const res = await client.api.login.$post({
        json: credentials,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Ошибка входа')
      }

      return res.json()
    },
    onSuccess: () => {
      // Редирект на главную или обновление стейта юзера
      window.location.href = '/'
    },
    onError: () => {console.log('Ошибка входа');}
  })
}