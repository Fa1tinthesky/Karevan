import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import OnboardingPage from "../pages/OnboardingPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../providers/Providers.tsx";
import OnboardingCheckRoute from "./OnboardingCheckRoute.tsx";

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
            ],
          },
          {
            path: "/onboarding",
            element: <OnboardingPage />,
          },
        ],
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
