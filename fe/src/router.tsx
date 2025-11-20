import { createBrowserRouter } from "react-router";
import App from "./Pages/App";
import ChatPage from "./Pages/ChatPage";
import ContactPage from "./Pages/ContactPage";
import LoginPage from "./Pages/LoginPage";
import RootErrorBoundary from "./components/ErrorBoundariy";

const router = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: RootErrorBoundary,
    element: <App />,
  },
  {
    path: "/contacts",
    ErrorBoundary: RootErrorBoundary,
    element: <ContactPage />,
  },
  {
    path: "/login",
    ErrorBoundary: RootErrorBoundary,
    element: <LoginPage />,
  },
  {
    path: "/chat/:contactId",
    ErrorBoundary: RootErrorBoundary,
    element: <ChatPage />,
  },
]);

export default router;
