import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Users as UsersIcon, Shield, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
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

const emptyForm = { name: "", email: "", company: "", designation: "", phone: "", industry: "", password: "" };

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const getUserRole = (userId: string) =>
    roles.find(r => r.user_id === userId && r.role === "admin") ? "admin" : "user";

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

  // ── Create User ──
  const handleCreate = async () => {
    if (!form.email || !form.password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        body: { action: "create", ...form },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "User created successfully" });
      setCreateOpen(false);
      setForm(emptyForm);
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error creating user", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Edit User ──
  const openEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      company: user.company || "",
      designation: user.designation || "",
      phone: user.phone || "",
      industry: user.industry || "",
      password: "",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        name: form.name,
        company: form.company,
        designation: form.designation,
        phone: form.phone,
        industry: form.industry,
      }).eq("id", selectedUser.id);
      if (error) throw error;
      toast({ title: "User updated successfully" });
      setEditOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error updating user", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete User ──
  const openDelete = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: { action: "delete", userId: selectedUser.id },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "User deleted successfully" });
      setDeleteOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error deleting user", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q || (p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q));
  });

  const FormFields = ({ showEmail = false, showPassword = false }: { showEmail?: boolean; showPassword?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name</Label>
        <Input className="col-span-3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      {showEmail && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Email</Label>
          <Input className="col-span-3" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      )}
      {showPassword && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Password</Label>
          <Input className="col-span-3" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
      )}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Company</Label>
        <Input className="col-span-3" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Designation</Label>
        <Input className="col-span-3" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Phone</Label>
        <Input className="col-span-3" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Industry</Label>
        <Input className="col-span-3" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, roles, and account status</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" disabled={togglingRole === user.id} onClick={() => toggleAdmin(user.id)}>
                              {togglingRole === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : role === "admin" ? "Remove Admin" : "Make Admin"}
                            </Button>
                            <Button variant="outline" size="sm" disabled={togglingActive === user.id} onClick={() => toggleActive(user.id, user.is_active)}>
                              {togglingActive === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : user.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDelete(user)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. The user will be able to log in immediately.</DialogDescription>
          </DialogHeader>
          <FormFields showEmail showPassword />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile information for {selectedUser?.email}.</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedUser?.name || selectedUser?.email}</strong> and all their data including dashboard access and query submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
