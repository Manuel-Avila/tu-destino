import ReportsTab from '../../components/home/ReportsTab';
import AdminReportsPage from './AdminReportsPage';
import { useAuthStore } from '../../store/authStore';

export default function AppReportsPage() {
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);
  return isAdmin ? <AdminReportsPage /> : <ReportsTab />;
}
