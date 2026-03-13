import { useEffect, useState } from "react"
import { useFilesQuery } from "~/queries/useFilesQuery"
import { useFilesStore } from "~/store/useFilesStore"
import { Group, Text, Box, Paper, Loader, Center, Stack, Badge } from "@mantine/core"
import { IconFolderFilled, IconFileText } from "@tabler/icons-react"
import type { ItemI } from "~/types/types"
import { Search } from "~/components/Search"
import { BreadcrumbsNav } from "~/components/BreadcrumbsNav"
import { useFileSearch } from "~/hooks/useFileSearch"
import { useRecentFilesStore } from "~/store/useRecentFilesStore"

export default function Files() {
    const { data, isSuccess, isLoading } = useFilesQuery()
    const { filesTree, setFilesTree } = useFilesStore()
    const { addRecentFile } = useRecentFilesStore()
    const [breadcrumbs, setBreadcrumbs] = useState<ItemI[]>([])
    
    const currentFolder = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null
    const initialItems = currentFolder ? currentFolder.children : filesTree

    const { 
        searchQuery, 
        setSearchQuery, 
        filteredItems: currentItems, 
        isSearching,
        bestMatchId
    } = useFileSearch(initialItems)

    // Синхронизируем свежие данные с бэкенда в нашем persisted store
    useEffect(() => {
        if (isSuccess && data?.files) {
            setFilesTree(data.files)
        }
    }, [data, isSuccess, setFilesTree])

    const currentPathName = currentFolder ? currentFolder.title : 'корне'

    return (
        <Box p="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <BreadcrumbsNav 
                breadcrumbs={breadcrumbs} 
                setBreadcrumbs={setBreadcrumbs} 
                onRootClick={() => setSearchQuery('')}
            />
            
            <Paper p="md" radius="md" style={{ flex: 1, overflow: 'auto', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                {isLoading && filesTree.length === 0 ? (
                    <Center h={200}>
                        <Stack align="center" gap="sm">
                            <Loader color="blue" type="dots" />
                            <Text c="dimmed" size="sm">Загрузка файлов...</Text>
                        </Stack>
                    </Center>
                ) : (!currentItems || currentItems.length === 0) ? (
                    <Center h={200}>
                        <Text c="dimmed">Папка пуста</Text>
                    </Center>
                ) : (
                    <Box>
                        {currentItems.map(item => {
                            const isFolder = item.type === "folder"
                            const isBestMatch = isSearching && item.id === bestMatchId

                            return (
                                <Group 
                                    key={item.id}
                                    gap="md" 
                                    wrap="nowrap" 
                                    onClick={() => {
                                        if (isFolder) {
                                            setBreadcrumbs(prev => [...prev, item])
                                        } else {
                                            addRecentFile(item)
                                        }
                                    }} 
                                    style={{ 
                                        cursor: isFolder ? 'pointer' : 'default', 
                                        padding: '12px', 
                                        borderRadius: '6px',
                                        backgroundColor: isBestMatch ? 'rgba(77, 171, 247, 0.08)' : 'transparent',
                                        border: isBestMatch ? '1px solid rgba(77, 171, 247, 0.2)' : '1px solid transparent'
                                    }} 
                                    className={isBestMatch ? "" : "hover:bg-gray-50 transition-colors"}
                                >
                                    {isFolder ? (
                                        <IconFolderFilled size={28} color="#fcc419" />
                                    ) : (
                                        <IconFileText size={28} color="#4dabf7" stroke={1.5} />
                                    )}
                                    <Stack gap={0} style={{ flex: 1 }}>
                                        <Group gap="xs">
                                            <Text size="sm" fw={isBestMatch ? 700 : 500} style={{ userSelect: 'none' }}>
                                                {item.title}
                                            </Text>
                                            {isBestMatch && (
                                                <Badge size="xs" variant="filled" color="blue">Лучшее совпадение</Badge>
                                            )}
                                        </Group>
                                        <Group gap="xs">
                                            {isFolder && (
                                                <Text size="xs" c="dimmed">
                                                    {item.children.length} {item.children.length === 1 ? 'объект' : [2, 3, 4].includes(item.children.length % 10) && ![12, 13, 14].includes(item.children.length % 100) ? 'объекта' : 'объектов'}
                                                </Text>
                                            )}
                                            {(isSearching || item.path !== '/') && (
                                                <Text size="xs" c="dimmed">
                                                    {isFolder ? '• ' : ''}{item.path}
                                                </Text>
                                            )}
                                        </Group>
                                    </Stack>

                                </Group>
                            )
                        })}
                    </Box>
                )}
            </Paper>

            <Box mt="md">
                <Search 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.currentTarget.value)} 
                    placeholder={`Поиск файлов в ${currentPathName}...`}
                />
            </Box>
        </Box>
    )
}