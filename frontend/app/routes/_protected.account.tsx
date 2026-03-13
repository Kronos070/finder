import { useAuthStore } from "~/store/useAuthStore"
import { Paper, Title, Text, Stack, Group, Avatar, Badge, Box, Divider } from "@mantine/core"
import { IconUser, IconMail, IconShield } from "@tabler/icons-react"

export default function Account() {
    const { user } = useAuthStore()

    if (!user) {
        return (
            <Box p="md">
                <Text>Пользователь не найден</Text>
            </Box>
        )
    }

    return (
        <Box p="md" h="100%" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper withBorder p="xl" radius="md" style={{ width: '100%', maxWidth: 500, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <Stack align="center" gap="md" mb="xl">
                    <Avatar size={100} radius={100} color="blue">
                        <IconUser size={50} />
                    </Avatar>
                    <Stack gap={4} align="center">
                        <Title order={2} fw={600}>{user.name}</Title>
                        <Badge variant="light" color="blue" size="lg">
                            {user.role === 'admin' ? 'Администратор' : 'Сотрудник'}
                        </Badge>
                    </Stack>
                </Stack>

                <Divider mb="xl" color="rgba(0, 0, 0, 0.04)" />

                <Stack gap="lg">
                    <Group wrap="nowrap">
                        <IconMail size={20} color="gray" />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Email</Text>
                            <Text size="sm" fw={500}>{user.email || 'email-не-указан@company.ru'}</Text>
                        </Stack>
                    </Group>

                    <Group wrap="nowrap">
                        <IconShield size={20} color="gray" />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Доступ</Text>
                            <Text size="sm" fw={500}>
                                {user.role === 'admin' ? 'Полный доступ к системе' : 'Просмотр и поиск файлов (ограниченный)'}
                            </Text>
                        </Stack>
                    </Group>
                    
                    <Group wrap="nowrap">
                        <IconUser size={20} color="gray" />
                        <Stack gap={0}>
                            <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>ID Пользователя</Text>
                            <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>USR-8492-BF</Text>
                        </Stack>
                    </Group>
                </Stack>
            </Paper>
        </Box>
    )
}