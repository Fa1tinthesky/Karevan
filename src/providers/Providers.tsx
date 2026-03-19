import { Outlet } from "react-router-dom";
import { SessionProvider } from "./SessionProvider";
import { QueryProvider } from "./QueryProvider";

const Providers = () => {
  return (
    <QueryProvider>
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    </QueryProvider>
  );
};

export default Providers;
