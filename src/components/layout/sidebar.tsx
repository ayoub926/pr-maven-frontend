import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Mail, MessageSquare, BarChart3, Inbox, Settings } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn("pb-12 border-r h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            PR Maven AI
          </h2>
          <div className="space-y-1">
            <Link to="/email-accounts">
              <Button
                variant={isActive("/email-accounts") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Accounts
              </Button>
            </Link>
            <Link to="/queries">
              <Button
                variant={isActive("/queries") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Queries
              </Button>
            </Link>
            <Link to="/replies">
              <Button
                variant={isActive("/replies") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Inbox className="mr-2 h-4 w-4" />
                Replies
              </Button>
            </Link>
            <Link to="/reporting">
              <Button
                variant={isActive("/reporting") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Reporting
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant={isActive("/settings") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}