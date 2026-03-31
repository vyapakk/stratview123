import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users as UsersIcon, Shield, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  designation: string | null;
  phone: string | null;
  industry: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "user";
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getUserRole = (userId: string) => {
    return roles.find(r => r.user_id === userId && r.role === "admin") ? "admin" : "user";
  };

  const toggleAdmin = async (userId: string) => {
    setTogglingRole(userId);
    const isCurrentlyAdmin = getUserRole(userId) === "admin";

    try {
      if (isCurrentlyAdmin) {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      } else {
        await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as const });
      }
      await fetchData();
      toast({ title: isCurrentlyAdmin ? "Admin role removed" : "Admin role granted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingRole(null);
    }
  };

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    setTogglingActive(userId);
    try {
      const { error } = await supabase.from("profiles").update({ is_active: !currentlyActive }).eq("id", userId);
      if (error) throw error;
      await fetchData();
      toast({ title: currentlyActive ? "User deactivated" : "User activated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingActive(null);
    }
  };

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q || (p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-primary" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users, roles, and account status</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">{profiles.length} Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(user => {
                    const role = getUserRole(user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "—"}</TableCell>
                        <TableCell className="text-sm">{user.email || "—"}</TableCell>
                        <TableCell className="text-sm">{user.company || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={role === "admin" ? "default" : "secondary"} className="text-xs">
                            {role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "destructive"} className="text-xs">
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={togglingRole === user.id}
                            onClick={() => toggleAdmin(user.id)}
                          >
                            {togglingRole === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : role === "admin" ? "Remove Admin" : "Make Admin"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={togglingActive === user.id}
                            onClick={() => toggleActive(user.id, user.is_active)}
                          >
                            {togglingActive === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
