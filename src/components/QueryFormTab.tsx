import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircleQuestion, Send, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { dashboardRegistry } from "@/dashboards/registry";

const mockProfile = {
  name: "John Doe",
  designation: "Research Analyst",
  company: "Acme Aerospace Inc.",
  email: "john.doe@company.com",
  phone: "+1 (555) 234-5678",
};

const QueryFormTab = () => {
  const location = useLocation();
  const match = dashboardRegistry.find((d) => d.routePath === location.pathname);
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(mockProfile.email);
  const [phone, setPhone] = useState(mockProfile.phone);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!match) return null;

  const dashboardTitle = match.title;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log("Query submitted:", { ...mockProfile, email, phone, query, dashboardTitle });
    setSubmitted(true);
    setTimeout(() => {
      toast({ title: "Query Submitted!", description: "Our research analyst will get in touch within 72 hours." });
      setQuery("");
      setSubmitted(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="query-tab-trigger fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3 py-4 rounded-l-lg border border-r-0 border-primary/40 bg-primary text-primary-foreground font-semibold text-sm shadow-lg cursor-pointer transition-transform hover:translate-x-0 translate-x-0"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          aria-label="Got a Query?"
        >
          <MessageCircleQuestion className="h-5 w-5 rotate-90 mb-1" />
          Got a Query?
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md border-border bg-card overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl text-foreground flex items-center gap-2">
            <MessageCircleQuestion className="h-6 w-6 text-primary" />
            Talk to our Research Analyst
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Have a question about <span className="font-medium text-foreground">{dashboardTitle}</span>?
            Fill in your query and our team will get in touch within <span className="font-semibold text-primary">72 hours</span>.
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-semibold text-foreground">Thank you!</p>
            <p className="text-muted-foreground text-center text-sm">Your query has been submitted. We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Profile</p>
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <Input value={mockProfile.name} readOnly className="bg-muted/50 text-foreground cursor-default" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Designation</Label>
                <Input value={mockProfile.designation} readOnly className="bg-muted/50 text-foreground cursor-default" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Company</Label>
                <Input value={mockProfile.company} readOnly className="bg-muted/50 text-foreground cursor-default" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="query-email" className="text-foreground text-sm">Email *</Label>
                <Input id="query-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your.email@company.com" />
              </div>
              <div>
                <Label htmlFor="query-phone" className="text-foreground text-sm">Phone</Label>
                <Input id="query-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div>
              <Label htmlFor="query-text" className="text-foreground text-sm">Your Query *</Label>
              <Textarea
                id="query-text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                rows={5}
                placeholder="Type your question here..."
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={!query.trim()}>
              <Send className="mr-2 h-4 w-4" /> Submit Query
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QueryFormTab;
