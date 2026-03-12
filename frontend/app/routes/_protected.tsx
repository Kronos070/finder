import { data, Outlet } from "react-router";
import { NavbarSimple } from "~/components/NavBarSimple";

export async function loader() {
  const isAuth = true; // CHANGED: Ваша реальная проверка
  
  if (!isAuth) {
    // Бросаем 404, чтобы сработал ErrorBoundary в root.tsx
    throw data(null, { status: 404 }); // CHANGED
  }
  return null;
}

export default function ProtectedLayout() {
  return (
    <div style={{ display: 'flex' }}> {/* CHANGED: Добавлен flex для навбара */}
        <NavbarSimple />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
    </div>
  )
}