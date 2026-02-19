import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, Mail, Users, Clock, ArrowRight, Download } from "lucide-react";
import { generateRiskPdf } from "@/utils/pdfExport";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChangeManagement = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const response = await axios.get(`${API}/risks`);
      setRisks(response.data);
    } catch (error) {
      console.error("Error fetching risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="change-management-page">
      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="risks" data-testid="risks-tab">
            <Shield className="h-4 w-4 mr-2" />
            Risk Mitigation
          </TabsTrigger>
          <TabsTrigger value="communications" data-testid="communications-tab">
            <Mail className="h-4 w-4 mr-2" />
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="active-risks-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Active Risks</p>
                    <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {risks.filter(r => r.status === "Active").length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="mitigated-risks-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Mitigated</p>
                    <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {risks.filter(r => r.status === "Mitigated").length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="high-impact-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">High Impact</p>
                    <p className="text-3xl font-bold text-red-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {risks.filter(r => r.impact === "High").length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Cards */}
          <div className="space-y-6">
            {risks.map((risk) => (
              <Card key={risk.id} className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid={`risk-card-${risk.risk_id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-slate-600">{risk.risk_id}</Badge>
                      <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {risk.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(risk.probability)}>
                        P: {risk.probability}
                      </Badge>
                      <Badge className={getRiskColor(risk.impact)}>
                        I: {risk.impact}
                      </Badge>
                      <Badge className={`${
                        risk.status === 'Active' ? 'bg-amber-100 text-amber-700' :
                        risk.status === 'Mitigated' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {risk.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">{risk.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-600" />
                        Mitigation Steps
                      </h4>
                      <ul className="space-y-2">
                        {risk.mitigation_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Contingency Plan
                      </h4>
                      <p className="text-sm text-red-800">{risk.contingency_plan}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Owner:</span>
                    <span className="text-sm font-medium text-slate-700">{risk.owner}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communications">
          {/* Internal Communication Draft */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="email-draft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <Mail className="h-5 w-5 text-slate-600" />
                Internal Communication Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-6 font-mono text-sm">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-500">To:</span>
                    <span className="text-slate-700">Operations Department, Customer Service Team</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-500">From:</span>
                    <span className="text-slate-700">Project Management Office</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-500">Subject:</span>
                    <span className="text-slate-700">Important: New Automated Claims Routing System - Go-Live Announcement</span>
                  </div>
                  <hr className="border-slate-300" />
                  
                  <div className="text-slate-700 space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <p>Dear Team,</p>
                    
                    <p>
                      We are excited to announce the launch of our new <strong>Automated Claims Routing System</strong>, 
                      which will go live on <strong>[Launch Date]</strong>. This initiative is part of Mapfre's ongoing 
                      commitment to operational excellence and improved customer service.
                    </p>

                    <div>
                      <p className="font-semibold mb-2">Scope of Change:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Automatic claim classification based on type and risk level</li>
                        <li>Zip code-based regional adjuster matching (2-minute SLA)</li>
                        <li>Low-risk claim auto-approval workflow</li>
                        <li>Real-time KPI dashboard for operations monitoring</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Business Objectives:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Reduce average ticket resolution time by 40%</li>
                        <li>Achieve 85%+ automatic routing success rate</li>
                        <li>Decrease escalation rate to below 15%</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Change Management Support:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Training Sessions:</strong> Mandatory sessions scheduled for [Dates]. See calendar invites.</li>
                        <li><strong>Quick Reference Guides:</strong> Available on the intranet and at each workstation.</li>
                        <li><strong>Support Hotline:</strong> Dedicated support line active for the first 30 days post-launch.</li>
                        <li><strong>Floor Support:</strong> Super-users will be available during peak hours for real-time assistance.</li>
                      </ul>
                    </div>

                    <p>
                      We understand that transitions can be challenging, and we are committed to supporting you every 
                      step of the way. Please reach out to your supervisor or the PMO if you have any questions or concerns.
                    </p>

                    <p>
                      Thank you for your continued dedication to serving our policyholders.
                    </p>

                    <p>
                      Best regards,<br />
                      <strong>Project Management Office</strong><br />
                      FNOL Workflow Optimization Initiative
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Management Methods */}
          <Card className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="change-methods">
            <CardHeader>
              <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Change Management Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Training & Education</h4>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Hands-on training workshops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Video tutorials and guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Certification upon completion</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-900">Support Structure</h4>
                  </div>
                  <ul className="text-sm text-emerald-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Dedicated help desk for 30 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Super-user buddy system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Daily office hours with SMEs</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-900">Phased Rollout</h4>
                  </div>
                  <ul className="text-sm text-amber-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>2-week parallel run period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Gradual feature activation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5" />
                      <span>Continuous feedback loop</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChangeManagement;
