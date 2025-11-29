import { createBrowserRouter } from 'react-router';
import App from './Pages/App';
import ContactPage from './Pages/ContactPage';
import RootErrorBoundary from './components/ErrorBoundariy';
import Protected from './components/Protected';
import RootLayout from './components/RootLayout';
import AuthPage from './Pages/AuthPage';

const router = createBrowserRouter([
  {
    path: '/',
    ErrorBoundary: RootErrorBoundary,
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: Protected,
        children: [
          { index: true, Component: App },
          { path: 'contacts', Component: ContactPage },
        ],
      },
      {
        path: '/auth',
        Component: AuthPage,
      },
    ],
  },
]);

export default router;
