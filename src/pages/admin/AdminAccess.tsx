import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShieldCheck, Plus, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { categories } from "@/data/datasets";

interface AccessRow {
  id: string;
  user_id: string;
  dashboard_id: string;
  valid_from: string;
  valid_to: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
}

// Build flat list of all dashboards
const allDashboards = (() => {
  const list: { id: string; label: string }[] = [];
  for (const cat of categories) {
    for (const ds of cat.datasets) {
      for (const db of ds.dashboards) {
        list.push({ id: db.id, label: `${cat.title} › ${ds.name} › ${db.name}` });
      }
    }
  }
  return list;
})();

const AdminAccess = () => {
  const [grants, setGrants] = useState<AccessRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Grant form state
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validTo, setValidTo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [grantsRes, profilesRes] = await Promise.all([
      supabase.from("dashboard_access").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, name, email"),
    ]);
    if (grantsRes.data) setGrants(grantsRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getUser = (userId: string) => profiles.find(p => p.id === userId);
  const getDashboardLabel = (id: string) => allDashboards.find(d => d.id === id)?.label || id;

  const handleGrant = async () => {
    if (!selectedUser || !selectedDashboard) {
      toast({ title: "Select user and dashboard", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("dashboard_access").insert({
        user_id: selectedUser,
        dashboard_id: selectedDashboard,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: validTo ? new Date(validTo).toISOString() : null,
      });
      if (error) throw error;
      toast({ title: "Access granted" });
      setDialogOpen(false);
      setSelectedUser("");
      setSelectedDashboard("");
      setValidTo("");
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from("dashboard_access").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Access revoked" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = grants.filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    const user = getUser(g.user_id);
    return (user?.name?.toLowerCase().includes(q) || user?.email?.toLowerCase().includes(q) || g.dashboard_id.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Dashboard Access
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Grant or revoke user access to dashboards</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Grant Access
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">{grants.length} Access Grants</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
                    <TableHead>User</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(grant => {
                    const user = getUser(grant.user_id);
                    return (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{user?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email || grant.user_id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">{getDashboardLabel(grant.dashboard_id)}</TableCell>
                        <TableCell className="text-sm">{new Date(grant.valid_from).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">
                          {grant.valid_to ? (
                            <Badge variant={new Date(grant.valid_to) < new Date() ? "destructive" : "secondary"} className="text-xs">
                              {new Date(grant.valid_to).toLocaleDateString()}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Unlimited</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deleting === grant.id}
                            onClick={() => handleRevoke(grant.id)}
                          >
                            {deleting === grant.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 mr-1" />Revoke</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No access grants found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Dashboard Access</DialogTitle>
            <DialogDescription>Select a user and dashboard to grant access to.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name || p.email || p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dashboard</Label>
              <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                <SelectTrigger><SelectValue placeholder="Select dashboard..." /></SelectTrigger>
                <SelectContent>
                  {allDashboards.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valid To (optional)</Label>
                <Input type="date" value={validTo} onChange={e => setValidTo(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleGrant} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Grant Access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAccess;
