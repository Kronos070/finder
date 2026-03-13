import { useState } from 'react';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconSearch,
  IconHistory
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from '../styles/NavBarSimple.module.css';
import { Link, useNavigate, useLocation } from 'react-router';
import { useLogoutMutation } from '~/queries/useLogoutMutation';

const data = [
  { link: '/', label: 'Поисковик', icon: IconSearch },
  { link: '/recent', label: 'Недавние', icon: IconHistory },
  { link: '/account', label: 'Аккаунт', icon:  IconUser },
  { link: '/settings', label: 'Настройки', icon: IconSettings },
];

export function NavbarSimple() {
  const location = useLocation()
  const [active, setActive] = useState(() => {
    const current = data.find(item => location.pathname === item.link)
    return current?.label || 'Поисковик'
  });
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()

  const handleLogout = () => {
    if (isLoggingOut) return
    logout()
  }

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={() => {
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

      <div className={`${classes.footer}`}>
        <a
          href="#"
          className={classes.link}
          onClick={(e) => {
            e.preventDefault()
            handleLogout()
          }}
          style={{ opacity: isLoggingOut ? 0.5 : 1 }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>{isLoggingOut ? 'Выход...' : 'Выйти'}</span>
        </a>
      </div>
    </nav>
  );
}