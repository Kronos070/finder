import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  LoadingOverlay,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import classes from '../styles/Authentication.module.css';
import { useAuthStore } from '~/store/useAuthStore';
import { useState, useEffect } from 'react';
import { useLoginMutation } from '~/queries/useLoginMutation';
import { Navigate } from 'react-router';
import type { CredentialsI } from '~/types/types';

export default function Authentication() {
  const { isAuth } = useAuthStore()
  const { mutate, isPending, error, reset } = useLoginMutation()
  const errorState = error as Error | null
  const [credentials, setCredentials] = useState<CredentialsI>({ email: '', password: '' })

  // Решаем проблему SSR (Hydration Mismatch):
  // Ждём пока компонент смонтируется на клиенте, прежде чем делать редирект на основе локального стейта
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Если уже авторизован — редиректим на главную
  if (mounted && isAuth) {
    return <Navigate to="/" replace />
  }

  const handleLogin = () => {
    reset()
    if (!credentials.email || !credentials.password) {
      return
    }
    mutate(credentials)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} pos="relative">
        <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ blur: 2 }} />
        
        <Title order={2} className={classes.title}>
          С возвращением!
        </Title>
        <Text c="dimmed" size="sm" mt={5}>
          Войдите в свой аккаунт
        </Text>

        {errorState && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Ошибка авторизации"
            color="red"
            mt="md"
            withCloseButton
            onClose={reset}
          >
            {errorState.message}
          </Alert>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <TextInput
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            onKeyDown={handleKeyDown}
            label="Email"
            name="email"
            autoComplete="email"
            placeholder="hello@gmail.com"
            size="md"
            radius="md"
            mt="md"
            disabled={isPending}
          />
          <PasswordInput
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            onKeyDown={handleKeyDown}
            label="Пароль"
            name="password"
            autoComplete="current-password"
            placeholder="Ваш пароль"
            mt="md"
            size="md"
            radius="md"
            disabled={isPending}
          />
          <Button
            type="submit"
            fullWidth
            mt="xl"
            size="md"
            radius="md"
            loading={isPending}
          >
            Войти
          </Button>
        </form>
      </Paper>
    </div>
  );
}