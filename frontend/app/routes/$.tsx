// app/routes/$.tsx
import { Button, Container, Title, Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import classes from '../styles/NotFound.module.css'; // CHANGED

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>Вы нашли секретное место.</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        К сожалению, этой страницы не существует. Возможно, вы ошиблись в адресе 
        или страница была перемещена на другой URL.
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" onClick={() => navigate('/')}>
          Вернуться на главную
        </Button>
      </Group>
    </Container>
  );
}