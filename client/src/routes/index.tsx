import { createBrowserRouter} from "react-router-dom";
import HomePage from "../pages/Homepage";

import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import GuestRoute from "../features/auth/components/GuestRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import FeedPage from "../features/feed/pages/Feed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
  element: <ProtectedRoute />,
  children: [
    {
      element: <AppLayout />,
      children: [
        {
          path: "feed",
          element: <FeedPage />,
        },
      ],
    },
  ],
},
])