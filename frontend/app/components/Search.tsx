import { TextInput } from '@mantine/core';
import type { TextInputProps } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export function Search(props: TextInputProps) {
    return (
        <TextInput
            leftSection={<IconSearch size={18} stroke={1.5} color="gray" />}
            radius="md"
            size="md"
            styles={{
                input: {
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    backgroundColor: '#fff',
                    transition: 'border-color 0.15s ease',
                }
            }}
            {...props}
        />
    )
}