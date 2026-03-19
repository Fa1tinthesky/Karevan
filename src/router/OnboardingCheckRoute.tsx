import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../context/SessionContext";

const OnboardingCheckRoute = () => {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (!user?.phone) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
};

export default OnboardingCheckRoute;
