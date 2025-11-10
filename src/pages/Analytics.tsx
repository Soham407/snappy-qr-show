import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft, TrendingUp, Globe, Smartphone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

interface QRCodeData {
  id: string;
  name: string;
  type: string;
  short_url: string | null;
  destination_url: string;
  status: string;
  created_at: string;
}

interface AnalyticsData {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
}

interface CountryStats {
  country: string;
  count: number;
}

interface DeviceStats {
  device_type: string;
  count: number;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  const fetchData = useCallback(async () => {
    if (!id) {
      toast.error("QR Code ID is missing");
      navigate("/dashboard");
      return;
    }

    // Fetch QR code details
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (qrError || !qrData) {
      toast.error("QR code not found");
      navigate("/dashboard");
      return;
    }

    if (qrData.type !== 'dynamic') {
      toast.error("Analytics are only available for dynamic QR codes");
      navigate("/dashboard");
      return;
    }

    setQrCode(qrData);

    // Fetch analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("qr_analytics")
      .select("*")
      .eq("qr_code_id", id)
      .order("scanned_at", { ascending: false });

    if (analyticsError) {
      toast.error("Failed to load analytics");
      console.error(analyticsError);
    } else {
      setAnalytics(analyticsData || []);
    }
  }, [id, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }
      
      setUser(session.user);
      await fetchData();
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (!session) {
        navigate("/signin");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, id, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!qrCode) {
    return null;
  }

  // Calculate statistics
  const totalScans = analytics.length;
  
  const countryStats: CountryStats[] = analytics.reduce((acc: CountryStats[], curr) => {
    const country = curr.country || 'Unknown';
    const existing = acc.find(s => s.country === country);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ country, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const deviceStats: DeviceStats[] = analytics.reduce((acc: DeviceStats[], curr) => {
    const device = curr.device_type || 'Unknown';
    const existing = acc.find(s => s.device_type === device);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ device_type: device, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Get scans in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentScans = analytics.filter(a => new Date(a.scanned_at) >= sevenDaysAgo).length;

  // Get scans in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyScans = analytics.filter(a => new Date(a.scanned_at) >= thirtyDaysAgo).length;

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
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">Analytics: {qrCode.name}</h1>
            <p className="text-muted-foreground">
              Track scans and performance metrics for your dynamic QR code
            </p>
            <div className="mt-4 text-sm space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Destination URL:</p>
              <p className="text-sm truncate">{qrCode.destination_url}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                  <p className="text-3xl font-bold">{totalScans}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
                  <p className="text-3xl font-bold">{recentScans}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                  <p className="text-3xl font-bold">{monthlyScans}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Countries</p>
                  <p className="text-3xl font-bold">{countryStats.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Geographic Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Scans by Country
              </h3>
              {countryStats.length > 0 ? (
                <div className="space-y-3">
                  {countryStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(stat.count / totalScans) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {stat.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No geographic data yet</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Scans by Device
              </h3>
              {deviceStats.length > 0 ? (
                <div className="space-y-3">
                  {deviceStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{stat.device_type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(stat.count / totalScans) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {stat.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No device data yet</p>
              )}
            </Card>
          </div>

          {/* Recent Scans */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
            {analytics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">City</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.slice(0, 10).map((scan) => (
                      <tr key={scan.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">{scan.country || 'Unknown'}</td>
                        <td className="py-3 px-4 text-sm">{scan.city || 'Unknown'}</td>
                        <td className="py-3 px-4 text-sm capitalize">{scan.device_type || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No scans yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your QR code to start tracking scans
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
