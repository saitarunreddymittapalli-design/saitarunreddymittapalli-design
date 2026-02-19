import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import WorkflowAnalysis from "@/pages/WorkflowAnalysis";
import BusinessRequirements from "@/pages/BusinessRequirements";
import UATTesting from "@/pages/UATTesting";
import Analytics from "@/pages/Analytics";
import ChangeManagement from "@/pages/ChangeManagement";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workflow" element={<WorkflowAnalysis />} />
            <Route path="requirements" element={<BusinessRequirements />} />
            <Route path="uat" element={<UATTesting />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="change-management" element={<ChangeManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
