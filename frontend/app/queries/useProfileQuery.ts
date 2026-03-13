import { useQuery } from '@tanstack/react-query'
import { client } from '~/lib/api'

interface ProfileResponse {
  name: string
}

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await client.api.profile.$get()

      if (!res.ok) throw new Error('Не авторизован')

      return (await res.json()) as ProfileResponse
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}
