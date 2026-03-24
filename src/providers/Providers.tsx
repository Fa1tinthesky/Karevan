import { Outlet } from "react-router-dom";
import { SessionProvider } from "./SessionProvider";
import { QueryProvider } from "./QueryProvider";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";

const Providers = () => {
  return (
    <QueryProvider>
      <SessionProvider>
          <TooltipProvider>
              <Toaster />
                <Outlet />
        </TooltipProvider>
      </SessionProvider>
    </QueryProvider>
  );
};

export default Providers;
