import { useMatch, Outlet } from "react-router-dom";

const LoginPage = () => {
  const match = useMatch("login/forgot-password");

  if (match) return <Outlet />;

  return <div>login page</div>;
};

export default LoginPage;
