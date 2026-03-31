import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Users, ShieldCheck, MessageSquare, ArrowLeft, LayoutDashboard } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Dashboard Access", url: "/admin/access", icon: ShieldCheck },
  { title: "Query Submissions", url: "/admin/queries", icon: MessageSquare },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                      >
                        <button onClick={() => navigate(item.url)} className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to App
            </Button>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
