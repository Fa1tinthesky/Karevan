import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

const App = lazy(() => import("../../App"));
const Login = lazy(() => import("../../features/auth/pages/LoginPage"));
const Register = lazy(() => import("../../features/auth/pages/RegisterPage"));
const VerifyEmail = lazy(
  () => import("../../features/auth/pages/VerifyEmailPage"),
);
const ForgotPassword = lazy(
  () => import("../../features/auth/pages/ForgotPasswordPage"),
);
const ResetPassword = lazy(
  () => import("../../features/auth/pages/ResetPasswordPage"),
);

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
        children: [
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
        ],
      },
      {
        path: "register",
        element: <Register />,
        children: [
          {
            path: 'verify-email',
            element: <VerifyEmail />,
          }
        ]
      },
      {
        path: "reset-password",
        element: <ResetPassword />
      }
    ],
  },
]);
