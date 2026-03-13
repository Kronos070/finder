import { Group, Text, Box, Paper, Center, Stack, Title } from "@mantine/core"
import { IconFileText, IconHistory } from "@tabler/icons-react"
import { useRecentFilesStore } from "~/store/useRecentFilesStore"
import { Search } from "~/components/Search"
import { useState, useMemo } from "react"
import Fuse from "fuse.js"

export default function RecentFiles() {
    const { recentFiles, addRecentFile } = useRecentFilesStore()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return recentFiles

        const fuse = new Fuse(recentFiles, {
            keys: ['title', 'path'],
            threshold: 0.4,
        })

        const result = fuse.search(searchQuery)
        return result.map(r => r.item)
    }, [recentFiles, searchQuery])

    const isSearching = searchQuery.trim().length > 0

    return (
        <Box p="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Paper p="sm" px="md" radius="md" mb="md" style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <Group gap="sm" align="center">
                    <IconHistory size={20} color="gray" />
                    <Title order={4} fw={600}>Недавние файлы</Title>
                </Group>
            </Paper>
            
            <Paper p="md" radius="md" style={{ flex: 1, overflow: 'auto', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                {recentFiles.length === 0 ? (
                    <Center h={200}>
                        <Text c="dimmed">Вы еще не открывали ни одного файла</Text>
                    </Center>
                ) : filteredItems.length === 0 ? (
                    <Center h={200}>
                        <Text c="dimmed">Ничего не найдено</Text>
                    </Center>
                ) : (
                    <Box>
                        {filteredItems.map(item => (
                            <Group 
                                key={`${item.id}-${item.path}`}
                                gap="md" 
                                wrap="nowrap" 
                                onClick={() => addRecentFile(item)}
                                style={{ 
                                    padding: '12px', 
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }} 
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <IconFileText size={28} color="#4dabf7" stroke={1.5} />
                                <Stack gap={0} style={{ flex: 1 }}>
                                    <Text size="sm" fw={500} style={{ userSelect: 'none' }}>
                                        {item.title}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {item.path}
                                    </Text>
                                </Stack>
                            </Group>
                        ))}
                    </Box>
                )}
            </Paper>

            <Box mt="md">
                <Search 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.currentTarget.value)} 
                    placeholder="Поиск по недавним..."
                />
            </Box>
        </Box>
    )
}
