import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Building2, Phone, Briefcase, Pencil, Save, X, Calendar, Lock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import AppFooter from "@/components/AppFooter";
import { categories } from "@/data/datasets";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";


const MyAccount = () => {
  const navigate = useNavigate();
  const { profile: authProfile, refreshProfile } = useAuth();
  const { hasAccess, activeGrants } = useAccessControl();
  const [isEditing, setIsEditing] = useState(false);

  // Subscriptions: dashboards user has access to, with validity dates
  const groupedSubscriptions = useMemo(() => {
    const subs: {
      categoryTitle: string;
      datasetName: string;
      dashboardName: string;
      dashboardId: string;
      validFrom: string;
      validTo: string;
    }[] = [];

    for (const cat of categories) {
      for (const ds of cat.datasets) {
        for (const db of ds.dashboards) {
          const grant = activeGrants.find(g => g.dashboard_id === db.id);
          if (grant) {
            subs.push({
              categoryTitle: cat.title,
              datasetName: ds.name,
              dashboardName: db.name,
              dashboardId: db.id,
              validFrom: grant.valid_from.split("T")[0],
              validTo: grant.valid_to ? grant.valid_to.split("T")[0] : "Ongoing",
            });
          }
        }
      }
    }

    const map = new Map<string, typeof subs>();
    for (const sub of subs) {
      const key = `${sub.categoryTitle} — ${sub.datasetName}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(sub);
    }
    return Array.from(map.entries());
  }, [activeGrants]);

  // Dashboards user doesn't have access to (for inquiry dropdown)
  const allDashboards = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    for (const cat of categories) {
      for (const ds of cat.datasets) {
        for (const db of ds.dashboards) {
          if (!hasAccess(db.id)) {
            list.push({ id: db.id, label: `${cat.title} › ${ds.name} › ${db.name}` });
          }
        }
      }
    }
    return list;
  }, [hasAccess]);
  
  const profileData = {
    name: authProfile?.name || "",
    email: authProfile?.email || "",
    company: authProfile?.company || "",
    designation: authProfile?.designation || "",
    phone: authProfile?.phone || "",
  };
  
  const [editData, setEditData] = useState(profileData);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiry, setInquiry] = useState({
    dashboard: "",
    message: "",
  });

  useEffect(() => {
    setEditData({
      name: authProfile?.name || "",
      email: authProfile?.email || "",
      company: authProfile?.company || "",
      designation: authProfile?.designation || "",
      phone: authProfile?.phone || "",
    });
  }, [authProfile]);

  const handleSave = async () => {
    if (!authProfile?.id) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: editData.name,
        company: editData.company,
        designation: editData.designation,
        phone: editData.phone,
      })
      .eq("id", authProfile.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    await refreshProfile();
    setIsEditing(false);
    toast({ title: "Profile updated", description: "Your personal information has been saved." });
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.dashboard) {
      toast({ title: "Please select a dashboard", variant: "destructive" });
      return;
    }
    // TODO: POST /api/user/inquiry
    console.log("Inquiry submitted:", inquiry);
    setInquirySubmitted(true);
    toast({ title: "Inquiry sent!", description: "Our team will get back to you shortly." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 container max-w-4xl px-4 md:px-6 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Account</h1>

        {/* ─── Personal Information ─── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
              <Label className="text-muted-foreground flex items-center gap-1.5 pt-2.5">
                <User className="h-4 w-4" /> Full Name
              </Label>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="h-10"
                />
              ) : (
                <p className="text-foreground pt-2.5 font-medium">{profileData.name}</p>
              )}
            </div>

            <Separator />

            {/* Email (read-only always) */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
              <Label className="text-muted-foreground flex items-center gap-1.5 pt-2.5">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <div className="flex items-center gap-2 pt-2.5">
                <p className="text-foreground font-medium">{profileData.email}</p>
                <span title="Email cannot be changed"><Lock className="h-3.5 w-3.5 text-muted-foreground/50" /></span>
              </div>
            </div>

            <Separator />

            {/* Company */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
              <Label className="text-muted-foreground flex items-center gap-1.5 pt-2.5">
                <Building2 className="h-4 w-4" /> Company
              </Label>
              {isEditing ? (
                <Input
                  value={editData.company}
                  onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                  className="h-10"
                />
              ) : (
                <p className="text-foreground pt-2.5 font-medium">{profileData.company}</p>
              )}
            </div>

            <Separator />

            {/* Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
              <Label className="text-muted-foreground flex items-center gap-1.5 pt-2.5">
                <Briefcase className="h-4 w-4" /> Designation
              </Label>
              {isEditing ? (
                <Input
                  value={editData.designation}
                  onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                  className="h-10"
                />
              ) : (
                <p className="text-foreground pt-2.5 font-medium">{profileData.designation}</p>
              )}
            </div>

            <Separator />

            {/* Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4">
              <Label className="text-muted-foreground flex items-center gap-1.5 pt-2.5">
                <Phone className="h-4 w-4" /> Phone
              </Label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="h-10"
                />
              ) : (
                <p className="text-foreground pt-2.5 font-medium">{profileData.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Your Subscriptions ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Subscriptions
            </CardTitle>
            <CardDescription>Dashboards you currently have access to</CardDescription>
          </CardHeader>
          <CardContent>
            {groupedSubscriptions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">You don't have any active subscriptions yet.</p>
            ) : (
              <div className="space-y-6">
                {groupedSubscriptions.map(([groupName, subs]) => (
                  <div key={groupName}>
                    <h4 className="text-sm font-semibold text-foreground mb-3">{groupName}</h4>
                    <div className="space-y-2">
                      {subs.map((sub) => (
                        <div
                          key={sub.dashboardId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3"
                        >
                          <span className="text-sm font-medium text-foreground">{sub.dashboardName}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                              From: <span className="font-medium text-foreground">{sub.validFrom}</span>
                            </span>
                            <span>
                              To: <span className="font-medium text-foreground">{sub.validTo}</span>
                            </span>
                            <Badge variant="secondary" className="text-[10px]">Active</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Inquiry Section ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Need to extend a subscription or buy a new one?
            </CardTitle>
            <CardDescription>Let us know which dashboards you're interested in and we'll get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            {inquirySubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <h3 className="font-semibold text-foreground">Inquiry Sent!</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Thank you for your interest. Our team will review your request and contact you shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setInquirySubmitted(false); setInquiry({ dashboard: "", message: "" }); }}>
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Which dashboard are you interested in?</Label>
                  <Select value={inquiry.dashboard} onValueChange={(v) => setInquiry({ ...inquiry, dashboard: v })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a dashboard..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allDashboards.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                      ))}
                      {allDashboards.length === 0 && (
                        <SelectItem value="__none" disabled>You already have access to all dashboards</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Additional Details</Label>
                  <Textarea
                    placeholder="Tell us about your requirements, number of users, preferred subscription duration, etc."
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="gradient-primary text-primary-foreground">
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
};

export default MyAccount;
