import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hola, {user?.fullName} 👋</h1>
      <p>Esta es una ruta protegida: solo se ve con sesión iniciada.</p>
      <p style={{ color: '#6b6f76' }}>{user?.email}</p>
      <button
        type="button"
        onClick={logout}
        style={{
          marginTop: '1.5rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '0.5rem',
          border: 'none',
          background: '#14453a',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
