import { useQuery } from "@tanstack/react-query"
import { client } from "~/lib/api"
import type { ItemI } from "~/types/types"

export const useFilesQuery = () => {
    return useQuery({
        queryKey: ["files"],
        queryFn: async () => {
            const res = await client.api.files.$get()

            if (!res.ok) throw new Error('Не авторизован')

            return (await res.json()) as {files: ItemI[]}
        }
    })
}