import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, CheckCircle, AlertCircle, Download } from "lucide-react";
import { generateBRDPdf } from "@/utils/pdfExport";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BusinessRequirements = () => {
  const [brd, setBrd] = useState(null);
  const [useCases, setUseCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brdRes, useCasesRes] = await Promise.all([
        axios.get(`${API}/brd`),
        axios.get(`${API}/use-cases`)
      ]);
      setBrd(brdRes.data);
      setUseCases(useCasesRes.data.use_cases);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6" data-testid="business-requirements-page">
      {/* Header Info */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="brd-header">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {brd?.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Version: {brd?.version}</span>
                <span>•</span>
                <span>Date: {brd?.date}</span>
                <span>•</span>
                <span>Project: {brd?.project}</span>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700">Approved</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="brd" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="brd" data-testid="brd-tab">
            <FileText className="h-4 w-4 mr-2" />
            BRD Document
          </TabsTrigger>
          <TabsTrigger value="use-cases" data-testid="use-cases-tab">
            <Target className="h-4 w-4 mr-2" />
            Use Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brd">
          <div className="space-y-6">
            {brd?.sections.map((section, index) => (
              <Card key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid={`brd-section-${index}`}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.content && (
                    <p className="text-slate-600 leading-relaxed">{section.content}</p>
                  )}
                  {section.requirements && (
                    <ul className="space-y-3">
                      {section.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="use-cases">
          <div className="grid gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid={`use-case-${useCase.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-slate-600">{useCase.id}</Badge>
                      <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {useCase.title}
                      </CardTitle>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700">Actor: {useCase.actor}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Precondition</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{useCase.precondition}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Scenario</h4>
                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {useCase.scenario}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Postcondition</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{useCase.postcondition}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <AlertCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">Success Criteria:</span>
                    <span className="text-sm text-slate-600">{useCase.success_criteria}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessRequirements;
