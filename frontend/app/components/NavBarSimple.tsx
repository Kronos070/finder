import { useState } from 'react';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconSearch
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../styles/NavBarSimple.module.css';
import { Link } from 'react-router';
import { useAuthStore } from '~/store/useAuthStore';

const data = [
  { link: '/search', label: 'Поисковик', icon: IconSearch },
  { link: '/account', label: 'Аккаунт', icon:  IconUser },
  { link: '/settings', label: 'Настройки', icon: IconSettings },
];

export function NavbarSimple() {
  const [active, setActive] = useState('Поисковик');
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <MantineLogo size={28} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
        {links}
      </div>

      <div className={`${classes.footer} cursor-pointer`}  onClick={handleLogout}>
        <Link to="/dsd" className={classes.link}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
}