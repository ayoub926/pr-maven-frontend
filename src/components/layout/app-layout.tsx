import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();
  
  // Determine the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/email-accounts")) {
      return path.includes("/add") ? "Add Email Account" : 
             path.includes("/edit") ? "Edit Email Account" : "Email Accounts";
    } else if (path.includes("/queries")) {
      return "Queries";
    } else if (path.includes("/replies")) {
      return "Replies";
    } else if (path.includes("/reporting")) {
      return "Reporting";
    } else if (path.includes("/settings")) {
      return "User Settings";
    }
    return "PR Maven AI";
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar title={getPageTitle()} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="w-64 flex-shrink-0" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}