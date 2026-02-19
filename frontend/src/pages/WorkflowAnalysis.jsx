import { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";

// As-Is Process Nodes (Manual Process)
const asIsNodes = [
  {
    id: "1",
    position: { x: 50, y: 200 },
    data: { label: "Customer Calls\nCall Center" },
    style: { background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "2",
    position: { x: 250, y: 200 },
    data: { label: "Rep Takes\nClaim Details" },
    style: { background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "3",
    position: { x: 450, y: 100 },
    data: { label: "Manual\nZip Code Lookup" },
    style: { background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "4",
    position: { x: 450, y: 300 },
    data: { label: "Manual\nClaim Review" },
    style: { background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "5",
    position: { x: 650, y: 200 },
    data: { label: "Supervisor\nReview Queue" },
    style: { background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "6",
    position: { x: 850, y: 100 },
    data: { label: "Manual\nAdjuster Assignment" },
    style: { background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "7",
    position: { x: 850, y: 300 },
    data: { label: "Email\nNotification" },
    style: { background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "8",
    position: { x: 1050, y: 200 },
    data: { label: "Claim\nProcessed" },
    style: { background: "#DBEAFE", border: "2px solid #3B82F6", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
];

const asIsEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#EF4444" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#EF4444" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } },
  { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#EF4444" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } },
  { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "#F59E0B" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" } },
  { id: "e4-5", source: "4", target: "5", animated: true, style: { stroke: "#F59E0B" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" } },
  { id: "e5-6", source: "5", target: "6", animated: true, style: { stroke: "#EF4444" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } },
  { id: "e5-7", source: "5", target: "7", animated: true, style: { stroke: "#EF4444" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" } },
  { id: "e6-8", source: "6", target: "8", animated: true, style: { stroke: "#3B82F6" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } },
  { id: "e7-8", source: "7", target: "8", animated: true, style: { stroke: "#3B82F6" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } },
];

// To-Be Process Nodes (Automated Process)
const toBeNodes = [
  {
    id: "1",
    position: { x: 50, y: 200 },
    data: { label: "Claim\nSubmitted" },
    style: { background: "#DCFCE7", border: "2px solid #10B981", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "2",
    position: { x: 250, y: 200 },
    data: { label: "Auto\nClassification" },
    style: { background: "#DCFCE7", border: "2px solid #10B981", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "3",
    position: { x: 450, y: 100 },
    data: { label: "Low Risk\nAuto-Approve" },
    style: { background: "#DCFCE7", border: "2px solid #10B981", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "4",
    position: { x: 450, y: 300 },
    data: { label: "High Risk\nSupervisor Queue" },
    style: { background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "5",
    position: { x: 650, y: 100 },
    data: { label: "Auto Regional\nAdjuster Match" },
    style: { background: "#DCFCE7", border: "2px solid #10B981", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "6",
    position: { x: 650, y: 300 },
    data: { label: "Manual Review\n(If Needed)" },
    style: { background: "#FEF3C7", border: "2px solid #F59E0B", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "7",
    position: { x: 850, y: 200 },
    data: { label: "Auto\nNotification" },
    style: { background: "#DCFCE7", border: "2px solid #10B981", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
  {
    id: "8",
    position: { x: 1050, y: 200 },
    data: { label: "Claim\nResolved" },
    style: { background: "#DBEAFE", border: "2px solid #3B82F6", borderRadius: "8px", padding: "10px", fontFamily: "Inter", fontSize: "12px", width: 140 },
  },
];

const toBeEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#10B981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#10B981", strokeWidth: 2 }, label: "85%", labelStyle: { fill: "#10B981", fontWeight: 600 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" } },
  { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#F59E0B", strokeWidth: 2 }, label: "15%", labelStyle: { fill: "#F59E0B", fontWeight: 600 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" } },
  { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "#10B981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" } },
  { id: "e4-6", source: "4", target: "6", animated: true, style: { stroke: "#F59E0B", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#F59E0B" } },
  { id: "e5-7", source: "5", target: "7", animated: true, style: { stroke: "#10B981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" } },
  { id: "e6-7", source: "6", target: "7", animated: true, style: { stroke: "#10B981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" } },
  { id: "e7-8", source: "7", target: "8", animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3B82F6" } },
];

const WorkflowAnalysis = () => {
  const [asIsNodesState, setAsIsNodes, onAsIsNodesChange] = useNodesState(asIsNodes);
  const [asIsEdgesState, setAsIsEdges, onAsIsEdgesChange] = useEdgesState(asIsEdges);
  const [toBeNodesState, setToBeNodes, onToBeNodesChange] = useNodesState(toBeNodes);
  const [toBeEdgesState, setToBeEdges, onToBeEdgesChange] = useEdgesState(toBeEdges);

  return (
    <div className="space-y-6" data-testid="workflow-analysis-page">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="as-is-summary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>As-Is Process</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span>8 manual touchpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span>Avg. 72 hour resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span>30% escalation rate</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="improvement-summary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <ArrowRight className="h-5 w-5 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Key Improvements</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700">-60%</Badge>
                <span>Manual touchpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700">-55%</Badge>
                <span>Resolution time</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700">85%</Badge>
                <span>Auto-routing rate</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="to-be-summary">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>To-Be Process</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>3 automated steps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Avg. 32 hour resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>&lt;15% escalation rate</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow Diagrams */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="workflow-diagrams">
        <CardHeader>
          <CardTitle className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Process Flow Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="as-is" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="as-is" className="data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="as-is-tab">
                As-Is (Manual)
              </TabsTrigger>
              <TabsTrigger value="to-be" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white" data-testid="to-be-tab">
                To-Be (Automated)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="as-is">
              <div className="bg-slate-50 rounded-xl p-2" style={{ height: "500px" }} data-testid="as-is-flowchart">
                <ReactFlow
                  nodes={asIsNodesState}
                  edges={asIsEdgesState}
                  onNodesChange={onAsIsNodesChange}
                  onEdgesChange={onAsIsEdgesChange}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">Pain Points Identified:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Multiple manual handoffs cause delays and errors</li>
                  <li>• Supervisor bottleneck creates backlogs</li>
                  <li>• No automated zip code matching - relies on rep knowledge</li>
                  <li>• Email notifications sent manually after each step</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="to-be">
              <div className="bg-slate-50 rounded-xl p-2" style={{ height: "500px" }} data-testid="to-be-flowchart">
                <ReactFlow
                  nodes={toBeNodesState}
                  edges={toBeEdgesState}
                  onNodesChange={onToBeNodesChange}
                  onEdgesChange={onToBeEdgesChange}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </div>
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-700 mb-2">Key Improvements:</h4>
                <ul className="text-sm text-emerald-600 space-y-1">
                  <li>• 85% of claims auto-classified and routed without human intervention</li>
                  <li>• Zip code matching automated with 2-minute SLA</li>
                  <li>• Only high-risk claims (15%) require manual review</li>
                  <li>• Automated notifications at every stage</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAnalysis;
