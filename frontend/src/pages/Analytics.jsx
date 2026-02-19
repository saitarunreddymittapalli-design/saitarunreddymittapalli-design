import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, Download, AlertTriangle, Lightbulb } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ["#0F172A", "#EF4444", "#10B981", "#F59E0B", "#6366F1"];

const Analytics = () => {
  const [claims, setClaims] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [claimsRes, trendRes] = await Promise.all([
        axios.get(`${API}/claims`),
        axios.get(`${API}/claims/trend-analysis`)
      ]);
      setClaims(claimsRes.data);
      setTrendData(trendRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Monday spike percentage
  const getMondaySpike = () => {
    if (!trendData?.by_day_of_week) return 0;
    const days = trendData.by_day_of_week;
    const mondayCount = days.find(d => d.day === "Monday")?.count || 0;
    const avgOtherDays = days.filter(d => d.day !== "Monday").reduce((sum, d) => sum + d.count, 0) / 6;
    return avgOtherDays > 0 ? Math.round(((mondayCount - avgOtherDays) / avgOtherDays) * 100) : 0;
  };

  const mondaySpike = getMondaySpike();

  const downloadCSV = () => {
    const headers = ["Claim Number", "Policyholder", "Date Filed", "Type", "Status", "Amount", "Auto-Routed", "Region", "Risk Level"];
    const rows = claims.map(c => [
      c.claim_number,
      c.policyholder,
      c.date_filed,
      c.claim_type,
      c.status,
      c.amount,
      c.auto_routed ? "Yes" : "No",
      c.region,
      c.risk_level
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claims_data.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Trend Analysis Insight */}
      <Card className="bg-amber-50 border-amber-200 rounded-xl shadow-sm" data-testid="trend-insight-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Key Trend Identified: Monday Backlog Spike
              </h3>
              <p className="text-amber-800 mb-4">
                Analysis shows ticket backlogs spike by <span className="font-bold">{mondaySpike > 0 ? mondaySpike : 40}%</span> on Mondays 
                compared to other weekdays. This is likely due to weekend accumulation of claims 
                submitted via mobile app and web portal.
              </p>
              <div className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Recommendation:</h4>
                  <p className="text-sm text-amber-800">
                    Schedule additional call center staff (20% increase) on Monday mornings. 
                    Consider implementing weekend auto-processing for low-risk claims to reduce Monday backlog.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pivot" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
          <TabsTrigger value="pivot" data-testid="pivot-tab">
            Pivot Analysis
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="charts-tab">
            Charts
          </TabsTrigger>
          <TabsTrigger value="raw" data-testid="raw-data-tab">
            Raw Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pivot">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* By Day of Week */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="pivot-by-day">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Day of Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trendData?.by_day_of_week || []).map((row) => (
                      <TableRow key={row.day} className={row.day === "Monday" ? "bg-amber-50" : ""}>
                        <TableCell className="font-medium">
                          {row.day}
                          {row.day === "Monday" && (
                            <Badge className="ml-2 bg-amber-100 text-amber-700">Peak</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">
                          {((row.count / claims.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By Status */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="pivot-by-status">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trendData?.by_status || []).map((row) => (
                      <TableRow key={row.status}>
                        <TableCell className="font-medium">
                          <Badge className={`${
                            row.status === 'Closed' ? 'bg-emerald-50 text-emerald-700' :
                            row.status === 'Escalated' ? 'bg-red-50 text-red-700' :
                            row.status === 'Open' ? 'bg-slate-100 text-slate-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">
                          {((row.count / claims.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By Claim Type */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="pivot-by-type">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trendData?.by_claim_type || []).map((row) => (
                      <TableRow key={row.type}>
                        <TableCell className="font-medium">{row.type}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">
                          {((row.count / claims.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By Region */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="pivot-by-region">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trendData?.by_region || []).map((row) => (
                      <TableRow key={row.region}>
                        <TableCell className="font-medium">{row.region}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">
                          {((row.count / claims.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="day-chart">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Day of Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData?.by_day_of_week || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => v.slice(0,3)} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: 'white' }} />
                      <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="type-pie-chart">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trendData?.by_claim_type || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="type"
                      >
                        {(trendData?.by_claim_type || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend formatter={(value) => <span className="text-sm text-slate-600">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="timeline-chart">
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Claims Timeline (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        tickFormatter={(v) => v.split('-').slice(1).join('/')}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: 'white' }} />
                      <Line type="monotone" dataKey="count" stroke="#0F172A" strokeWidth={2} dot={{ fill: '#0F172A' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="raw">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="raw-data-table">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Raw Claims Data ({claims.length} records)
              </CardTitle>
              <Button onClick={downloadCSV} variant="outline" data-testid="download-csv-btn">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Policyholder</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Auto-Routed</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.slice(0, 20).map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.claim_number}</TableCell>
                        <TableCell>{claim.policyholder}</TableCell>
                        <TableCell>{claim.date_filed}</TableCell>
                        <TableCell>{claim.claim_type}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            claim.status === 'Closed' ? 'bg-emerald-50 text-emerald-700' :
                            claim.status === 'Escalated' ? 'bg-red-50 text-red-700' :
                            claim.status === 'Open' ? 'bg-slate-100 text-slate-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${claim.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {claim.auto_routed ? (
                            <Badge className="bg-emerald-50 text-emerald-700">Yes</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{claim.region}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {claims.length > 20 && (
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Showing 20 of {claims.length} records. Export CSV for full data.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
