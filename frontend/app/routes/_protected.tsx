import { Outlet, Navigate } from "react-router";
import { NavbarSimple } from "~/components/NavBarSimple";
import { useAuthStore } from "~/store/useAuthStore";

export default function ProtectedLayout() {
  const { isAuth } = useAuthStore()

  if (!isAuth) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div style={{ display: 'flex' }}>
        <NavbarSimple />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
    </div>
  )
}