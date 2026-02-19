import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck, Bug, Plus, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { generateUATPdf } from "@/utils/pdfExport";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UATTesting = () => {
  const [testScripts, setTestScripts] = useState([]);
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDefectDialogOpen, setIsDefectDialogOpen] = useState(false);
  const [newDefect, setNewDefect] = useState({
    title: "",
    description: "",
    severity: "Medium",
    reported_by: "QA Team"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scriptsRes, defectsRes] = await Promise.all([
        axios.get(`${API}/test-scripts`),
        axios.get(`${API}/defects`)
      ]);
      setTestScripts(scriptsRes.data);
      setDefects(defectsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (scriptId, status) => {
    try {
      await axios.put(`${API}/test-scripts/${scriptId}`, {
        status,
        tested_by: "Current User"
      });
      setTestScripts(prev => prev.map(s => 
        s.script_id === scriptId ? { ...s, status, tested_date: new Date().toISOString().split('T')[0] } : s
      ));
      toast.success(`Test ${scriptId} marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update test status");
    }
  };

  const createDefect = async () => {
    try {
      const response = await axios.post(`${API}/defects`, newDefect);
      setDefects(prev => [...prev, response.data]);
      setIsDefectDialogOpen(false);
      setNewDefect({ title: "", description: "", severity: "Medium", reported_by: "QA Team" });
      toast.success("Defect created successfully");
    } catch (error) {
      toast.error("Failed to create defect");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pass":
        return <Badge className="bg-emerald-50 text-emerald-700"><CheckCircle className="h-3 w-3 mr-1" />Pass</Badge>;
      case "Fail":
        return <Badge className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Fail</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-500 text-white">{severity}</Badge>;
      case "High":
        return <Badge className="bg-red-100 text-red-700">{severity}</Badge>;
      case "Medium":
        return <Badge className="bg-amber-100 text-amber-700">{severity}</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{severity}</Badge>;
    }
  };

  const passRate = testScripts.length > 0 
    ? Math.round((testScripts.filter(t => t.status === "Pass").length / testScripts.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="uat-testing-page">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="total-tests-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Tests</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {testScripts.length}
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="pass-rate-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pass Rate</p>
                <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {passRate}%
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="failed-tests-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Failed Tests</p>
                <p className="text-3xl font-bold text-red-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {testScripts.filter(t => t.status === "Fail").length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="open-defects-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Open Defects</p>
                <p className="text-3xl font-bold text-amber-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {defects.filter(d => d.status === "Open" || d.status === "In Progress").length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Bug className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scripts" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="scripts" data-testid="test-scripts-tab">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Test Scripts
          </TabsTrigger>
          <TabsTrigger value="defects" data-testid="defects-tab">
            <Bug className="h-4 w-4 mr-2" />
            Defect Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="test-scripts-table">
            <CardHeader>
              <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                UAT Test Scripts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Steps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tested By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testScripts.map((script) => (
                    <TableRow key={script.id} data-testid={`test-row-${script.script_id}`}>
                      <TableCell className="font-medium">{script.script_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{script.title}</p>
                          <p className="text-xs text-slate-500">{script.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-slate-500">{script.steps.length} steps</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(script.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {script.tested_by || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => updateTestStatus(script.script_id, "Pass")}
                            data-testid={`pass-btn-${script.script_id}`}
                          >
                            Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateTestStatus(script.script_id, "Fail")}
                            data-testid={`fail-btn-${script.script_id}`}
                          >
                            Fail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Defect Escalation Protocol */}
          <Card className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="escalation-protocol">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Defect Escalation Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">1. Log the Defect</h4>
                  <p className="text-sm text-slate-600">
                    Create a detailed defect ticket with reproduction steps, expected vs actual results, and screenshots.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">2. Assign Severity</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <span className="font-medium text-red-600">Critical:</span> System down</li>
                    <li>• <span className="font-medium text-amber-600">High:</span> Major function broken</li>
                    <li>• <span className="font-medium text-slate-600">Medium/Low:</span> Minor issues</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">3. Escalate</h4>
                  <p className="text-sm text-slate-600">
                    Critical defects escalate to Development Lead immediately. Track exposure until cleanup confirmed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="defects-table">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Defect Tracker
              </CardTitle>
              <Dialog open={isDefectDialogOpen} onOpenChange={setIsDefectDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-defect-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Defect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log New Defect</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newDefect.title}
                        onChange={(e) => setNewDefect(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief defect title"
                        data-testid="defect-title-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDefect.description}
                        onChange={(e) => setNewDefect(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description with reproduction steps"
                        data-testid="defect-description-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={newDefect.severity}
                        onValueChange={(value) => setNewDefect(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger data-testid="defect-severity-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={createDefect} className="w-full" data-testid="submit-defect-btn">
                      Submit Defect
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defects.map((defect) => (
                    <TableRow key={defect.id} data-testid={`defect-row-${defect.defect_id}`}>
                      <TableCell className="font-medium">{defect.defect_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{defect.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{defect.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(defect.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          defect.status === 'Open' ? 'border-red-200 text-red-600' :
                          defect.status === 'In Progress' ? 'border-amber-200 text-amber-600' :
                          defect.status === 'Resolved' ? 'border-emerald-200 text-emerald-600' :
                          'border-slate-200 text-slate-600'
                        }`}>
                          {defect.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{defect.reported_by}</TableCell>
                      <TableCell className="text-sm text-slate-500">{defect.reported_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UATTesting;
