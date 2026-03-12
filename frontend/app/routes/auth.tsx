import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from '@mantine/core';
import classes from '../styles/Authentication.module.css';
import { redirect } from 'react-router';
import { useAuthStore } from '~/store/useAuthStore';
import { use, useState, useState } from 'react';
import { useLoginMutation } from '~/queries/useLoginMutation';
import type { CredentialsI } from '~/types/types';

export async function loader() {
  const isAuth = true; // CHANGED: Если сессия есть
  
  if (isAuth) return redirect("/")
  return null;
}

export default function Authentication() {
  const { setUser } = useAuthStore()
  const { mutate } = useLoginMutation()
  const [credentials, setCredentials] = useState<CredentialsI>({ email: '', password: '' })

  const handleLogin = () => {
    mutate(credentials, {
    onSuccess: (res) => {
      // Предположим, бэк вернул { user: { name: 'Admin', ... } }
      setUser(res.user) 
      navigate('/dashboard')
    }
  })
  } 

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to Mantine!
        </Title>

        <TextInput value={credentials.email} onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))} label="Email address" placeholder="hello@gmail.com" size="md" radius="md" />
        <PasswordInput value={credentials.password} onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))} label="Password" placeholder="Your password" mt="md" size="md" radius="md" />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md" onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </div>
  );
}