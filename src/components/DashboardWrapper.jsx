import { useOutletContext } from 'react-router-dom';
import Dashboard from './Dashboard';

export default function DashboardWrapper() {
  const { isDark } = useOutletContext();
  return <Dashboard isDark={isDark} />;
}
