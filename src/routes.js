import { Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import CategoryPage from './pages/CategoryPage';
import DashboardAppPage from './pages/DashboardAppPage';
import ProductsNewPage from './pages/ProductsNew';
import ProductShowPage from './pages/ProductShowPage';
import CategoryShowPage from "./pages/CategoryShowPage";
import UserPage from './pages/UserPage';
import Quires from './pages/Quires'
import Orders from './pages/Orders'
import Setting from './pages/Settings'
export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'categories', element: <UserPage /> },
        { path: 'products', element: <ProductsNewPage /> },
        { path: 'queries', element: <Quires /> },
        { path: 'setting', element: <Setting /> },
        { path: 'report', element: <CategoryPage /> },
        { path: 'orders', element: <Orders /> },
        { path: 'products/:id', element: <ProductShowPage /> },
        { path: "categories/:id", element: <CategoryShowPage /> },
        // { path: 'categories', element: <CategoryPage /> },
      ],
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/login" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
