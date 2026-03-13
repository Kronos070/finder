import { Paper, Title, Text, Stack, Button, Group, Box, Divider, Badge } from "@mantine/core"
import { IconTrash, IconHistory, IconSettings } from "@tabler/icons-react"
import { useRecentFilesStore } from "~/store/useRecentFilesStore"

export default function Settings() {
    const { clearRecentFiles, recentFiles } = useRecentFilesStore()

    return (
        <Box p="md" h="100%" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper withBorder p="xl" radius="md" style={{ width: '100%', maxWidth: 600, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <Group gap="sm" mb="xl">
                    <IconSettings size={24} color="gray" />
                    <Title order={2} fw={600}>Настройки</Title>
                </Group>

                <Stack gap="xl">
                    <Box>
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                                <IconHistory size={20} color="gray" />
                                <Text fw={600}>История просмотров</Text>
                            </Group>
                            <Badge color="blue" variant="light">
                                {recentFiles.length} файлов
                            </Badge>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md">
                            Здесь вы можете управлять списком недавно открытых файлов. 
                            Очистка истории не удалит сами файлы, только записи об их открытии.
                        </Text>
                        <Button 
                            variant="light" 
                            color="red" 
                            leftSection={<IconTrash size={16} />}
                            onClick={clearRecentFiles}
                            disabled={recentFiles.length === 0}
                        >
                            Очистить недавние файлы
                        </Button>
                    </Box>

                    <Divider color="rgba(0, 0, 0, 0.04)" />

                    <Box>
                        <Text fw={600} mb="xs">О приложении</Text>
                        <Text size="sm" c="dimmed">
                            Версия: 1.0.0 (Stable)<br />
                            Система поиска и управления файлами для сотрудников.
                        </Text>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}