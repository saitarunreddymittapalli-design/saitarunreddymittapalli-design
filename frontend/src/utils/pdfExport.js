import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Author info for all PDFs
const AUTHOR = {
  name: 'Sai Tarun Reddy',
  title: 'Operations Analyst',
  email: 'saitarunreddymittapalli@gmail.com'
};

export const generateBRDPdf = (brd, useCases) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Requirements Document', 14, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${brd.project}`, 14, 28);
  doc.text(`Version ${brd.version} | ${brd.date}`, 14, 35);
  
  // Author badge
  doc.setFontSize(9);
  doc.text(`Prepared by: ${AUTHOR.name} | ${AUTHOR.title}`, 14, 42);

  yPosition = 60;
  doc.setTextColor(15, 23, 42);

  // Sections
  brd.sections.forEach((section, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, 14, yPosition);
    yPosition += 8;

    // Section Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate-600

    if (section.content) {
      const lines = doc.splitTextToSize(section.content, pageWidth - 28);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 5 + 8;
    }

    if (section.requirements) {
      section.requirements.forEach((req, reqIndex) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const bulletLines = doc.splitTextToSize(`• ${req}`, pageWidth - 32);
        doc.text(bulletLines, 18, yPosition);
        yPosition += bulletLines.length * 5 + 3;
      });
      yPosition += 5;
    }

    yPosition += 5;
  });

  // Use Cases Section
  doc.addPage();
  yPosition = 20;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Use Cases', 14, 16);

  yPosition = 40;
  doc.setTextColor(15, 23, 42);

  useCases.forEach((uc, index) => {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Use Case Header
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(14, yPosition - 6, pageWidth - 28, 12, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${uc.id}: ${uc.title}`, 18, yPosition);
    yPosition += 12;

    // Actor
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Actor: ', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(uc.actor, 30, yPosition);
    yPosition += 8;

    // Precondition
    doc.setFont('helvetica', 'bold');
    doc.text('Precondition:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const preLines = doc.splitTextToSize(uc.precondition, pageWidth - 32);
    doc.text(preLines, 18, yPosition);
    yPosition += preLines.length * 5 + 5;

    // Scenario
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Scenario:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const scenarioLines = doc.splitTextToSize(uc.scenario, pageWidth - 32);
    doc.text(scenarioLines, 18, yPosition);
    yPosition += scenarioLines.length * 5 + 5;

    // Expected Result
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Expected Result:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129); // Emerald
    const resultLines = doc.splitTextToSize(uc.postcondition, pageWidth - 32);
    doc.text(resultLines, 18, yPosition);
    yPosition += resultLines.length * 5 + 15;
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${AUTHOR.name} | ${AUTHOR.email} | Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save('FNOL_Business_Requirements_Document.pdf');
};

export const generateUATPdf = (testScripts, defects) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UAT Test Plan', 14, 16);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Auto Claims FNOL Workflow Optimization', 14, 26);
  
  // Author badge
  doc.setFontSize(9);
  doc.text(`Prepared by: ${AUTHOR.name} | ${AUTHOR.title}`, 14, 38);

  // Test Summary
  let yPosition = 55;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Summary', 14, yPosition);
  yPosition += 10;

  const passCount = testScripts.filter(t => t.status === 'Pass').length;
  const failCount = testScripts.filter(t => t.status === 'Fail').length;
  const notStarted = testScripts.filter(t => t.status === 'Not Started').length;
  const passRate = testScripts.length > 0 ? Math.round((passCount / testScripts.length) * 100) : 0;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Test Scripts: ${testScripts.length}`, 14, yPosition);
  doc.text(`Passed: ${passCount}  |  Failed: ${failCount}  |  Not Started: ${notStarted}`, 14, yPosition + 6);
  doc.text(`Pass Rate: ${passRate}%`, 14, yPosition + 12);
  yPosition += 25;

  // Test Scripts Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Scripts', 14, yPosition);
  yPosition += 5;

  const tableData = testScripts.map(script => [
    script.script_id,
    script.title,
    script.steps.length + ' steps',
    script.status,
    script.tested_by || '-',
    script.tested_date || '-'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['ID', 'Title', 'Steps', 'Status', 'Tested By', 'Date']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 }
    },
    styles: { fontSize: 8 }
  });

  // Defects Section
  doc.addPage();
  
  doc.setFillColor(239, 68, 68); // Red
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Defect Register', 14, 16);

  yPosition = 35;
  doc.setTextColor(15, 23, 42);

  if (defects.length > 0) {
    const defectData = defects.map(d => [
      d.defect_id,
      d.title,
      d.severity,
      d.status,
      d.reported_by,
      d.reported_date
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['ID', 'Title', 'Severity', 'Status', 'Reported By', 'Date']],
      body: defectData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      styles: { fontSize: 8 }
    });
  } else {
    doc.setFontSize(10);
    doc.text('No defects logged.', 14, yPosition);
  }

  // Escalation Protocol
  yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 60;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Defect Escalation Protocol', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  const protocol = [
    '1. Log the Defect: Create detailed ticket with reproduction steps, expected vs actual results, screenshots',
    '2. Assign Severity: Critical (System down), High (Major function broken), Medium/Low (Minor issues)',
    '3. Escalate: Critical defects escalate to Development Lead immediately. Track exposure until resolved.'
  ];

  protocol.forEach(step => {
    const lines = doc.splitTextToSize(step, pageWidth - 28);
    doc.text(lines, 14, yPosition);
    yPosition += lines.length * 5 + 5;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`${AUTHOR.name} | ${AUTHOR.email} | Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save('FNOL_UAT_Test_Plan.pdf');
};

export const generateRiskPdf = (risks) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(245, 158, 11); // Amber
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Mitigation Plan', 14, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Auto Claims FNOL Workflow Optimization', 14, 28);

  let yPosition = 50;

  risks.forEach((risk, index) => {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Risk Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPosition - 6, pageWidth - 28, 14, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${risk.risk_id}: ${risk.title}`, 18, yPosition);
    
    // Probability/Impact badges
    doc.setFontSize(8);
    doc.text(`P: ${risk.probability}  |  I: ${risk.impact}  |  Status: ${risk.status}`, 18, yPosition + 6);
    yPosition += 18;

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(risk.description, pageWidth - 32);
    doc.text(descLines, 14, yPosition);
    yPosition += descLines.length * 5 + 8;

    // Mitigation Steps
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Mitigation Steps:', 14, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    risk.mitigation_steps.forEach(step => {
      const stepLines = doc.splitTextToSize(`✓ ${step}`, pageWidth - 36);
      doc.text(stepLines, 18, yPosition);
      yPosition += stepLines.length * 4 + 2;
    });
    yPosition += 5;

    // Contingency Plan
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text('Contingency Plan:', 14, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    const contingencyLines = doc.splitTextToSize(risk.contingency_plan, pageWidth - 32);
    doc.text(contingencyLines, 14, yPosition);
    yPosition += contingencyLines.length * 5 + 8;

    // Owner
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Owner: ${risk.owner}`, 14, yPosition);
    yPosition += 15;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`MAPFRE FNOL System - Risk Plan | Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save('FNOL_Risk_Mitigation_Plan.pdf');
};

export const generateAnalyticsPdf = (claims, trendData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Data Trend Analysis Report', 14, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Auto Claims FNOL - Last 30 Days', 14, 28);

  let yPosition = 50;

  // Key Insight Box
  doc.setFillColor(254, 243, 199); // Amber-50
  doc.rect(14, yPosition - 5, pageWidth - 28, 30, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, yPosition - 5, pageWidth - 28, 30, 'S');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY FINDING: Monday Backlog Spike', 18, yPosition + 3);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Analysis shows ticket backlogs spike by ~40% on Mondays compared to other weekdays.', 18, yPosition + 12);
  doc.text('Recommendation: Schedule 20% additional staff on Monday mornings.', 18, yPosition + 19);
  
  yPosition += 40;

  // Summary Stats
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Claims: ${claims.length}`, 14, yPosition);
  doc.text(`Closed: ${claims.filter(c => c.status === 'Closed').length}`, 70, yPosition);
  doc.text(`Open: ${claims.filter(c => c.status === 'Open').length}`, 110, yPosition);
  doc.text(`Escalated: ${claims.filter(c => c.status === 'Escalated').length}`, 150, yPosition);
  yPosition += 15;

  // Claims by Day Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Claims by Day of Week', 14, yPosition);
  yPosition += 5;

  if (trendData?.by_day_of_week) {
    const dayData = trendData.by_day_of_week.map(d => [
      d.day,
      d.count.toString(),
      ((d.count / claims.length) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Day', 'Count', '% of Total']],
      body: dayData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 } },
      styles: { fontSize: 9 }
    });
  }

  // Claims by Type Table
  yPosition = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Claims by Type', 14, yPosition);
  yPosition += 5;

  if (trendData?.by_claim_type) {
    const typeData = trendData.by_claim_type.map(t => [
      t.type,
      t.count.toString(),
      ((t.count / claims.length) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Claim Type', 'Count', '% of Total']],
      body: typeData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 }
    });
  }

  // Claims by Region
  yPosition = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Claims by Region', 14, yPosition);
  yPosition += 5;

  if (trendData?.by_region) {
    const regionData = trendData.by_region.map(r => [
      r.region,
      r.count.toString(),
      ((r.count / claims.length) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Region', 'Count', '% of Total']],
      body: regionData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`MAPFRE FNOL System - Analytics Report | Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save('FNOL_Data_Trend_Analysis.pdf');
};
