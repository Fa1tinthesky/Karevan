import { createBrowserRouter } from "react-router-dom";
import "../index.css";

import HomePage from "../pages/HomePage.tsx";
import NotFound from "@/pages/NotFound.tsx";
import OnboardingPage from "../pages/OnboardingPage.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../providers/Providers.tsx";
import OnboardingCheckRoute from "./OnboardingCheckRoute.tsx";
import Wallet from "@/pages/Wallet.tsx";
import GoalDetail from "@/pages/GoalDetail.tsx";
import Signup from "@/pages/auth/Signup.tsx";
import Login from "@/pages/auth/Login.tsx";


const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/",
            element: <OnboardingCheckRoute />,
            children: [
              {
                path: "/",
                element: <HomePage />,
              },
              {
                  path: "/wallet",
                  element: <Wallet />
              },
              {
                  path: "/goal/:id",
                  element: <GoalDetail />
              }
            ],
          },
          {
            path: "/onboarding",
            element: <OnboardingPage />,
          },
        ],
      },
      {
        path: "/auth/login",
        element: <Login />,
      },
      {
        path: "/auth/sign-up",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
