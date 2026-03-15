import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import KeyboardPage from '../pages/KeyboardPage';
import SettingsPage from '../pages/SettingsPage';
import ConnectionPage from '../pages/ConnectionPage';
import AboutPage from '../pages/AboutPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <KeyboardPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'connection',
        element: <ConnectionPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
]);
