import { createBrowserRouter, Navigate } from 'react-router';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import VehicleDetails from './pages/VehicleDetails';
import ServiceSelection from './pages/ServiceSelection';
import ProductSelection from './pages/ProductSelection';
import AddService from './pages/AddService';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'vehicles/add',
        element: <AddVehicle />,
      },
      {
        path: 'vehicles/:id',
        element: <VehicleDetails />,
      },
      {
        path: 'vehicles/:vehicleId/service',
        element: <ServiceSelection />,
      },
      {
        path: 'vehicles/:vehicleId/service/:serviceId/products',
        element: <ProductSelection />,
      },
      {
        path: 'vehicles/:vehicleId/service/:serviceId/add',
        element: <AddService />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);