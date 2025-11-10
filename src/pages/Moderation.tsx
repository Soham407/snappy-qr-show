import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft, AlertTriangle, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ReportedQRCode {
  id: string;
  name: string;
  type: string;
  short_url: string | null;
  destination_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Moderation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportedCodes, setReportedCodes] = useState<ReportedQRCode[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }
      
      setUser(session.user);
      await fetchReportedCodes();
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchReportedCodes = async () => {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("status", "reported")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reported QR codes");
      console.error(error);
    } else {
      setReportedCodes(data || []);
    }
  };

  const handleResolve = async (id: string, action: 'activate' | 'block') => {
    const newStatus = action === 'activate' ? 'active' : 'blocked';
    
    const { error } = await supabase
      .from("qr_codes")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast.error(`Failed to ${action} QR code`);
      console.error(error);
    } else {
      toast.success(`QR code ${action === 'activate' ? 'reactivated' : 'blocked'} successfully`);
      fetchReportedCodes();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick QR
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold mb-2">QR Code Moderation</h1>
              <p className="text-muted-foreground">
                Review and moderate reported QR codes
              </p>
            </div>
          </div>

          {/* Stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Reports</p>
                <p className="text-3xl font-bold">{reportedCodes.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </Card>

          {/* Reported QR Codes List */}
          {reportedCodes.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">No Pending Reports</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  All reported QR codes have been reviewed. Great work keeping the platform safe!
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {reportedCodes.map((qr) => (
                <Card key={qr.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <h3 className="font-semibold text-lg">{qr.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                            Reported
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-3">
                          Type: {qr.type}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {qr.type === 'dynamic' && qr.short_url && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Redirect URL:</p>
                              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                                {`https://dikifwudqhstaadzpgss.supabase.co/functions/v1/qr-redirect/${qr.short_url}`}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Destination URL:</p>
                            <p className="text-sm font-mono bg-muted px-3 py-2 rounded break-all">
                              {qr.destination_url}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Created:</p>
                              <p>{new Date(qr.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Reported:</p>
                              <p>{new Date(qr.updated_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleResolve(qr.id, 'activate')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve & Reactivate
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          if (confirm('Are you sure you want to permanently block this QR code?')) {
                            handleResolve(qr.id, 'block');
                          }
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Block QR Code
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Moderation;
