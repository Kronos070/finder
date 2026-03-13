import { Group, Paper, Breadcrumbs, Anchor } from "@mantine/core"
import type { ItemI } from "~/types/types"

interface BreadcrumbsNavProps {
    breadcrumbs: ItemI[]
    setBreadcrumbs: (breadcrumbs: ItemI[]) => void
    onRootClick?: () => void
}

export function BreadcrumbsNav({ breadcrumbs, setBreadcrumbs, onRootClick }: BreadcrumbsNavProps) {
    return (
        <Paper p="sm" px="md" radius="md" mb="md" style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <Group gap="sm" align="center">
                <Breadcrumbs separator="/">
                    <Anchor 
                        component="button" 
                        onClick={() => {
                            setBreadcrumbs([])
                            onRootClick?.()
                        }} 
                        c={breadcrumbs.length === 0 ? "black" : "blue"}
                        fw={breadcrumbs.length === 0 ? 600 : 400}
                        style={{ textDecoration: 'none' }}
                    >
                        Корень
                    </Anchor>
                    {breadcrumbs.map((crumb, index) => (
                        <Anchor 
                            component="button"
                            key={crumb.id} 
                            onClick={() => setBreadcrumbs(breadcrumbs.slice(0, index + 1))}
                            c={index === breadcrumbs.length - 1 ? "black" : "blue"}
                            fw={index === breadcrumbs.length - 1 ? 600 : 400}
                            style={{ textDecoration: 'none' }}
                        >
                            {crumb.title}
                        </Anchor>
                    ))}
                </Breadcrumbs>
            </Group>
        </Paper>
    )
}
