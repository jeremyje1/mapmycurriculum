// @ts-nocheck
import { NextResponse } from 'next/server';
import { getAccreditationTemplate } from '@/lib/accreditation-templates';
import 'iconv-lite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AccreditationReportRequest {
  templateId: string;
  institutionData: {
    name: string;
    address?: string;
    preparedBy?: string;
    title?: string;
    chiefAcademicOfficer?: string;
    accreditationLiaison?: string;
    reportDate: string;
    academicYear: string;
    catalogYear?: string;
    department?: string;
    programName?: string;
    programCoordinator?: string;
  };
  curriculumData: {
    programs: any[];
    courses: any[];
    outcomes: any[];
    alignments: any[];
    gapAnalysis: any;
    metrics: any;
  };
  options?: {
    includeLogo?: boolean;
    includeCharts?: boolean;
    includeAppendices?: boolean;
  };
}

function validate(body: any): body is AccreditationReportRequest {
  return body && 
         body.templateId && 
         body.institutionData && 
         body.institutionData.name &&
         body.curriculumData;
}

async function buildAccreditationPdf(request: AccreditationReportRequest): Promise<Buffer> {
  const PDFKit: any = (await import('pdfkit')).default;
  const template = getAccreditationTemplate(request.templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${request.templateId}`);
  }

  const doc: any = new PDFKit({ 
    margin: 60, 
    size: 'LETTER',
    info: { 
      Title: template.name,
      Author: request.institutionData.preparedBy || request.institutionData.name,
      Subject: `Accreditation Evidence Report - ${template.accreditor}`
    }
  });

  const chunks: any[] = [];
  doc.on('data', (c: any) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  // Helper functions
  const primaryColor = '#1b4ae8';
  const secondaryColor = '#4b5563';
  const lightGray = '#e5e7eb';

  function addCoverPage() {
    // Institution name
    doc.fontSize(24).fillColor('#111').text(request.institutionData.name, { align: 'center' });
    doc.moveDown(0.5);
    
    if (request.institutionData.address) {
      doc.fontSize(10).fillColor(secondaryColor).text(request.institutionData.address, { align: 'center' });
      doc.moveDown(2);
    } else {
      doc.moveDown(1.5);
    }

    // Report title
    doc.fontSize(20).fillColor(primaryColor).text(template.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor(secondaryColor).text(`${template.accreditor} Evidence Report`, { align: 'center' });
    doc.moveDown(3);

    // Report metadata
    doc.fontSize(11).fillColor('#111');
    const metadata = [
      { label: 'Report Date', value: request.institutionData.reportDate },
      { label: 'Academic Year', value: request.institutionData.academicYear }
    ];

    if (request.institutionData.catalogYear) {
      metadata.push({ label: 'Catalog Year', value: request.institutionData.catalogYear });
    }
    if (request.institutionData.preparedBy) {
      metadata.push({ label: 'Prepared By', value: request.institutionData.preparedBy });
    }
    if (request.institutionData.title) {
      metadata.push({ label: 'Title', value: request.institutionData.title });
    }
    if (request.institutionData.chiefAcademicOfficer) {
      metadata.push({ label: 'Chief Academic Officer', value: request.institutionData.chiefAcademicOfficer });
    }
    if (request.institutionData.accreditationLiaison) {
      metadata.push({ label: 'Accreditation Liaison', value: request.institutionData.accreditationLiaison });
    }

    metadata.forEach(({ label, value }) => {
      doc.text(`${label}: `, { continued: true }).fillColor(secondaryColor).text(value).fillColor('#111');
    });

    doc.moveDown(4);
    doc.fontSize(9).fillColor(secondaryColor).text(
      'This report was generated using Map My Curriculum\'s AI-powered curriculum compliance platform. ' +
      'All data is derived from the institution\'s official curriculum mapping and assessment records.',
      { align: 'center', width: 450 }
    );
  }

  function addTableOfContents() {
    doc.addPage();
    doc.fontSize(18).fillColor('#111').text('Table of Contents', { underline: true });
    doc.moveDown(1);

    doc.fontSize(10);
    template.sections.forEach((section, index) => {
      const pageNum = 3 + (index * 2); // Approximate page numbers
      doc.fillColor(primaryColor).text(`${section.criterion || `Section ${index + 1}`}`, { continued: true });
      doc.fillColor(secondaryColor).text(` - ${section.title}`, { continued: true });
      doc.text(`.`.repeat(60 - section.title.length), { continued: true });
      doc.text(pageNum.toString());
      doc.moveDown(0.3);
    });
  }

  function addSection(section: any) {
    doc.addPage();
    
    // Section header
    doc.fontSize(16).fillColor(primaryColor).text(section.criterion || section.title, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor('#111').text(section.title);
    doc.moveDown(1);

    // Subsections
    section.subsections.forEach((subsection: any) => {
      doc.fontSize(12).fillColor(primaryColor).text(subsection.heading, { underline: true });
      doc.moveDown(0.4);
      
      doc.fontSize(10).fillColor(secondaryColor).text(subsection.description);
      doc.moveDown(0.5);

      if (subsection.narrative) {
        doc.fontSize(10).fillColor('#111').text(subsection.narrative, { align: 'justify' });
        doc.moveDown(0.8);
      }

      // Add data visualization based on dataSource
      if (subsection.includeTable) {
        addDataTable(subsection.dataSource);
      }

      if (subsection.includeChart && request.options?.includeCharts) {
        addDataChart(subsection.dataSource);
      }

      doc.moveDown(1);
    });
  }

  function addDataTable(dataSource: string) {
    doc.fontSize(9).fillColor('#111');
    
    const tableY = doc.y;
    const tableX = 60;
    const colWidth = 150;

    switch (dataSource) {
      case 'alignmentMatrix':
        doc.fontSize(10).fillColor(primaryColor).text('Curriculum Alignment Matrix', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#111');

        // Header
        doc.rect(tableX, doc.y, colWidth * 3, 20).fillAndStroke(lightGray, '#999');
        doc.fillColor('#111').text('Program Learning Outcome', tableX + 5, doc.y - 15, { width: colWidth - 10 });
        doc.text('Course', tableX + colWidth + 5, doc.y, { width: colWidth - 10 });
        doc.text('Level (I/D/M)', tableX + colWidth * 2 + 5, doc.y, { width: colWidth - 10 });
        doc.moveDown(1.5);

        // Sample data rows
        const alignmentSample = request.curriculumData.alignments?.slice(0, 10) || [];
        alignmentSample.forEach((alignment: any) => {
          const rowY = doc.y;
          doc.rect(tableX, rowY, colWidth * 3, 18).stroke('#ccc');
          doc.fillColor('#111').text(alignment.plo_code || 'PLO', tableX + 5, rowY + 5, { width: colWidth - 10 });
          doc.text(`${alignment.course_subject || ''} ${alignment.course_number || ''}`, tableX + colWidth + 5, rowY + 5, { width: colWidth - 10 });
          doc.text(alignment.level || '', tableX + colWidth * 2 + 5, rowY + 5, { width: colWidth - 10 });
          doc.y = rowY + 18;
        });
        doc.moveDown(1);
        break;

      case 'gapAnalysis':
        doc.fontSize(10).fillColor(primaryColor).text('Gap Analysis Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#111');

        const gap = request.curriculumData.gapAnalysis || {};
        doc.text(`Total PLOs: ${gap.totalPLOs || 0}`);
        doc.text(`Mapped PLOs: ${gap.mappedPLOs || 0}`);
        doc.text(`Coverage Percentage: ${gap.coveragePercentage || 0}%`);
        doc.moveDown(0.5);

        if (gap.unmappedPLOs && gap.unmappedPLOs.length > 0) {
          doc.fillColor('#dc2626').text(`Unmapped Outcomes (${gap.unmappedPLOs.length}):`);
          doc.fillColor(secondaryColor);
          gap.unmappedPLOs.forEach((plo: any) => {
            doc.text(`  • ${plo.code}: ${plo.description || ''}`);
          });
        }
        doc.moveDown(1);
        break;

      case 'programMetrics':
        doc.fontSize(10).fillColor(primaryColor).text('Program Metrics', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#111');

        const metrics = request.curriculumData.metrics || {};
        doc.text(`Total Credit Hours: ${metrics.totalCredits || 0}`);
        doc.text(`Core Credit Hours: ${metrics.coreCredits || 0}`);
        doc.text(`Number of Courses: ${request.curriculumData.courses?.length || 0}`);
        doc.text(`Number of Learning Outcomes: ${request.curriculumData.outcomes?.length || 0}`);
        doc.moveDown(1);
        break;

      case 'courseData':
        doc.fontSize(10).fillColor(primaryColor).text('Course Listing', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#111');

        // Header
        doc.rect(tableX, doc.y, colWidth * 3, 20).fillAndStroke(lightGray, '#999');
        doc.fillColor('#111').text('Course Code', tableX + 5, doc.y - 15, { width: colWidth - 10 });
        doc.text('Course Title', tableX + colWidth + 5, doc.y, { width: colWidth - 10 });
        doc.text('Credits', tableX + colWidth * 2 + 5, doc.y, { width: colWidth - 10 });
        doc.moveDown(1.5);

        const courseSample = request.curriculumData.courses?.slice(0, 15) || [];
        courseSample.forEach((course: any) => {
          const rowY = doc.y;
          doc.rect(tableX, rowY, colWidth * 3, 18).stroke('#ccc');
          doc.fillColor('#111').text(`${course.subject || ''} ${course.number || ''}`, tableX + 5, rowY + 5, { width: colWidth - 10 });
          doc.text(course.title || '', tableX + colWidth + 5, rowY + 5, { width: colWidth - 10 });
          doc.text(course.credits?.toString() || '', tableX + colWidth * 2 + 5, rowY + 5, { width: colWidth - 10 });
          doc.y = rowY + 18;
        });
        doc.moveDown(1);
        break;

      case 'outcomeData':
        doc.fontSize(10).fillColor(primaryColor).text('Learning Outcomes', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#111');

        const outcomesSample = request.curriculumData.outcomes?.slice(0, 10) || [];
        outcomesSample.forEach((outcome: any, index: number) => {
          doc.text(`${index + 1}. ${outcome.code || ''}: ${outcome.description || ''}`);
        });
        doc.moveDown(1);
        break;
    }
  }

  function addDataChart(dataSource: string) {
    if (dataSource === 'gapAnalysis') {
      const gap = request.curriculumData.gapAnalysis || {};
      const coveragePct = gap.coveragePercentage || 0;
      const gapPct = 100 - coveragePct;

      // Simple pie chart representation
      doc.fontSize(10).fillColor(primaryColor).text('Coverage Visualization', { underline: true });
      doc.moveDown(0.5);

      const centerX = 150;
      const centerY = doc.y + 60;
      const radius = 50;

      // Draw "pie slices" as colored bars for simplicity
      doc.rect(60, doc.y, 150, 20).fillAndStroke('#10b981', '#000');
      doc.fillColor('#fff').fontSize(10).text(`${coveragePct.toFixed(1)}% Covered`, 70, doc.y - 15);

      doc.rect(60, doc.y + 5, 150, 20).fillAndStroke('#dc2626', '#000');
      doc.fillColor('#fff').text(`${gapPct.toFixed(1)}% Gap`, 70, doc.y - 15);

      doc.moveDown(3);
    }
  }

  function addFooter(pageNumber: number) {
    const bottom = 750;
    doc.fontSize(8).fillColor(secondaryColor).text(
      `${request.institutionData.name} | ${template.accreditor} Evidence Report | Page ${pageNumber}`,
      60,
      bottom,
      { align: 'center', width: 480 }
    );
  }

  // Build the PDF
  addCoverPage();
  addTableOfContents();

  template.sections.forEach((section) => {
    addSection(section);
  });

  // Appendix (if requested)
  if (request.options?.includeAppendices) {
    doc.addPage();
    doc.fontSize(16).fillColor(primaryColor).text('Appendix A: Methodology', { underline: true });
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#111').text(
      'This accreditation evidence report was generated using Map My Curriculum\'s automated curriculum ' +
      'mapping and compliance platform. The system performs the following analyses:\n\n' +
      '1. Gap Analysis: Identifies program learning outcomes not mapped to course-level assessments\n' +
      '2. Alignment Matrix: Maps PLOs to courses with Introduction-Development-Mastery progression\n' +
      '3. Coverage Metrics: Calculates percentage of outcomes with adequate assessment coverage\n' +
      '4. Compliance Checking: Validates curriculum against accreditor-specific requirements\n\n' +
      'All data is derived from the institution\'s official curriculum management system and validated ' +
      'through the platform\'s RulePack evaluation engine.',
      { align: 'justify' }
    );
  }

  // Final page
  doc.addPage();
  doc.fontSize(14).fillColor(primaryColor).text('Report Certification', { align: 'center', underline: true });
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#111').text(
    'This report accurately represents the curriculum mapping and assessment data for ' +
    `${request.institutionData.name} as of ${request.institutionData.reportDate}.`,
    { align: 'justify' }
  );
  doc.moveDown(2);
  doc.text('Signature: _________________________________  Date: _______________');
  doc.moveDown(1);
  doc.text(`Prepared by: ${request.institutionData.preparedBy || ''}`);
  doc.text(`Title: ${request.institutionData.title || ''}`);

  doc.end();
  return done;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!validate(body)) {
      return NextResponse.json({ 
        error: 'Invalid request. Required: templateId, institutionData (with name), curriculumData' 
      }, { status: 400 });
    }

    const pdf = await buildAccreditationPdf(body);
    
    const filename = `${body.templateId}_${body.institutionData.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    return new NextResponse(pdf as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': (pdf as any).length?.toString() || ''
      }
    });
  } catch (err: any) {
    console.error('Accreditation PDF generation error:', err);
    return NextResponse.json({ 
      error: 'PDF generation failed',
      details: err.message 
    }, { status: 500 });
  }
}
