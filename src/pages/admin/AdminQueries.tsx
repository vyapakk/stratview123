import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QueryRow {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  designation: string | null;
  phone: string | null;
  query: string | null;
  dashboard_title: string | null;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
  user_id: string | null;
}

const statusColors: Record<string, string> = {
  new: "destructive",
  in_progress: "default",
  resolved: "secondary",
};

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const AdminQueries = () => {
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("query_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setQueries(data as QueryRow[]);
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("query_submissions")
        .update({ status: newStatus as QueryRow["status"] })
        .eq("id", id);
      if (error) throw error;
      toast({ title: `Status updated to ${statusLabels[newStatus]}` });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = queries.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (q.name?.toLowerCase().includes(s) || q.email?.toLowerCase().includes(s) || q.company?.toLowerCase().includes(s) || q.query?.toLowerCase().includes(s) || q.dashboard_title?.toLowerCase().includes(s));
  });

  const counts = {
    new: queries.filter(q => q.status === "new").length,
    in_progress: queries.filter(q => q.status === "in_progress").length,
    resolved: queries.filter(q => q.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Query Submissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage user queries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["new", "in_progress", "resolved"] as const).map(status => (
          <Card key={status}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{counts[status]}</p>
              <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">{queries.length} Submissions</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(q => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium text-sm">{q.name || "—"}</TableCell>
                      <TableCell className="text-sm">{q.email || "—"}</TableCell>
                      <TableCell className="text-sm">{q.company || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{q.dashboard_title || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{q.query || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[q.status] as any} className="text-xs">
                          {statusLabels[q.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(q.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={q.status}
                          onValueChange={(val) => updateStatus(q.id, val)}
                          disabled={updatingId === q.id}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No submissions found
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

export default AdminQueries;
