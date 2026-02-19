import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ["#0F172A", "#EF4444", "#10B981", "#F59E0B", "#6366F1"];

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kpiRes, trendRes, claimsRes] = await Promise.all([
        axios.get(`${API}/kpi-metrics`),
        axios.get(`${API}/claims/trend-analysis`),
        axios.get(`${API}/claims`)
      ]);
      setKpis(kpiRes.data);
      setTrendData(trendRes.data);
      setClaims(claimsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const recentClaims = claims.slice(0, 5);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border-none">
          <p className="font-medium">{label}</p>
          <p className="text-emerald-400">{payload[0].value} claims</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children" data-testid="dashboard-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-resolution-time">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {kpis?.avg_resolution_time || 0}h
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">12% faster</span>
                </div>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <Clock className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-auto-route">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Auto-Route Success</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {kpis?.auto_route_success_rate || 0}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">Target: 85%</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-escalation">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Escalation Rate</p>
                <p className="text-3xl font-bold text-red-500 mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {kpis?.escalation_rate || 0}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">Target: &lt;15%</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-total-claims">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Claims</p>
                <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {kpis?.total_claims || 0}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                    {kpis?.closed_claims || 0} Closed
                  </Badge>
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                    {kpis?.open_claims || 0} Open
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims Timeline */}
        <Card className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="claims-timeline-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Claims Volume Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData?.timeline || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0F172A" 
                    strokeWidth={2}
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Claims by Type */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="claims-by-type-chart">
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Day */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="claims-by-day-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Claims by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData?.by_day_of_week || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="recent-claims-list">
          <CardHeader>
            <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Recent Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div 
                  key={claim.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  data-testid={`claim-${claim.claim_number}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      claim.status === 'Closed' ? 'bg-emerald-500' :
                      claim.status === 'Escalated' ? 'bg-red-500' :
                      claim.status === 'In Review' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="font-medium text-sm text-slate-900">{claim.claim_number}</p>
                      <p className="text-xs text-slate-500">{claim.policyholder}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        claim.status === 'Closed' ? 'bg-emerald-50 text-emerald-700' :
                        claim.status === 'Escalated' ? 'bg-red-50 text-red-700' :
                        claim.status === 'In Review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {claim.status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">${claim.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
