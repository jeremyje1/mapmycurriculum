/**
 * Accreditation Report Templates
 * HLC (Higher Learning Commission) and SACSCOC (Southern Association of Colleges and Schools Commission on Colleges)
 * 
 * These templates structure PDF reports according to accreditor requirements
 */

export interface AccreditationTemplate {
  id: string;
  name: string;
  accreditor: 'HLC' | 'SACSCOC' | 'ABET' | 'MSCHE' | 'NEASC' | 'WSCUC' | 'NWCCU';
  sections: TemplateSection[];
  coverPageConfig: CoverPageConfig;
}

export interface TemplateSection {
  id: string;
  title: string;
  criterion?: string; // e.g., "Criterion 3", "Standard 8.2"
  subsections: Subsection[];
  requiresEvidence: boolean;
}

export interface Subsection {
  id: string;
  heading: string;
  description: string;
  dataSource: 'gapAnalysis' | 'alignmentMatrix' | 'programMetrics' | 'courseData' | 'outcomeData';
  includeTable?: boolean;
  includeChart?: boolean;
  narrative?: string;
}

export interface CoverPageConfig {
  logoRequired: boolean;
  institutionFields: string[];
  dateFields: string[];
  accreditorLogo?: string;
}

/**
 * HLC Criterion 3: Teaching and Learning - Quality, Resources, and Support
 */
export const HLC_CRITERION_3_TEMPLATE: AccreditationTemplate = {
  id: 'hlc-criterion-3',
  name: 'HLC Criterion 3: Teaching and Learning',
  accreditor: 'HLC',
  coverPageConfig: {
    logoRequired: true,
    institutionFields: ['name', 'address', 'preparedBy', 'title'],
    dateFields: ['reportDate', 'academicYear']
  },
  sections: [
    {
      id: 'hlc-3a',
      title: '3.A. The institution\'s degree programs are appropriate to higher education',
      criterion: 'Criterion 3.A',
      requiresEvidence: true,
      subsections: [
        {
          id: 'hlc-3a-1',
          heading: '3.A.1 Courses and programs are current and require levels of performance by students appropriate to the degree or certificate awarded',
          description: 'Evidence of program learning outcomes aligned with degree level expectations',
          dataSource: 'alignmentMatrix',
          includeTable: true,
          narrative: 'This section demonstrates how program learning outcomes (PLOs) are systematically mapped to course learning outcomes (CLOs) with appropriate progression from Introduction (I) to Development (D) to Mastery (M) levels.'
        },
        {
          id: 'hlc-3a-2',
          heading: '3.A.2 The institution articulates and differentiates learning goals for its undergraduate, graduate, post-baccalaureate, post-graduate, and certificate programs',
          description: 'Program-level learning outcomes documentation',
          dataSource: 'programMetrics',
          includeTable: true,
          narrative: 'Program learning outcomes are clearly defined and distinguish between degree levels. Each program has measurable outcomes that align with institutional mission and professional standards.'
        },
        {
          id: 'hlc-3a-3',
          heading: '3.A.3 The institution\'s program quality and learning goals are consistent across all modes of delivery and all locations',
          description: 'Consistency analysis across delivery modes',
          dataSource: 'courseData',
          includeChart: true,
          narrative: 'All program offerings, regardless of delivery method or location, maintain consistent learning outcomes and quality standards as evidenced by curriculum mapping.'
        }
      ]
    },
    {
      id: 'hlc-3b',
      title: '3.B. The institution demonstrates that the exercise of intellectual inquiry and the acquisition, application, and integration of broad learning and skills are integral to its educational programs',
      criterion: 'Criterion 3.B',
      requiresEvidence: true,
      subsections: [
        {
          id: 'hlc-3b-1',
          heading: '3.B.1 The general education program is appropriate to the mission, educational offerings, and degree levels of the institution',
          description: 'General education curriculum mapping',
          dataSource: 'gapAnalysis',
          includeTable: true,
          narrative: 'The general education program provides a foundation of knowledge and skills appropriate to all degree programs. Gap analysis confirms comprehensive coverage of general education competencies.'
        },
        {
          id: 'hlc-3b-2',
          heading: '3.B.2 The institution articulates the purposes, content, and intended learning outcomes of its undergraduate general education requirements',
          description: 'General education learning outcomes documentation',
          dataSource: 'outcomeData',
          includeTable: true
        },
        {
          id: 'hlc-3b-3',
          heading: '3.B.3 Every degree program offered by the institution engages students in collecting, analyzing, and communicating information',
          description: 'Information literacy integration across programs',
          dataSource: 'alignmentMatrix',
          includeTable: true
        }
      ]
    }
  ]
};

/**
 * HLC Criterion 4: Teaching and Learning - Evaluation and Improvement
 */
export const HLC_CRITERION_4_TEMPLATE: AccreditationTemplate = {
  id: 'hlc-criterion-4',
  name: 'HLC Criterion 4: Teaching and Learning - Evaluation and Improvement',
  accreditor: 'HLC',
  coverPageConfig: {
    logoRequired: true,
    institutionFields: ['name', 'address', 'preparedBy', 'title'],
    dateFields: ['reportDate', 'academicYear']
  },
  sections: [
    {
      id: 'hlc-4a',
      title: '4.A. The institution demonstrates responsibility for the quality of its educational programs',
      criterion: 'Criterion 4.A',
      requiresEvidence: true,
      subsections: [
        {
          id: 'hlc-4a-1',
          heading: '4.A.1 The institution maintains a practice of regular program reviews',
          description: 'Program review evidence including gap analysis and improvement plans',
          dataSource: 'gapAnalysis',
          includeTable: true,
          includeChart: true,
          narrative: 'Regular curriculum mapping and gap analysis ensures continuous program improvement. Identified gaps trigger systematic remediation plans with measurable outcomes.'
        },
        {
          id: 'hlc-4a-2',
          heading: '4.A.2 The institution evaluates all the credit that it transcripts',
          description: 'Credit hour validation and course-level compliance',
          dataSource: 'courseData',
          includeTable: true
        },
        {
          id: 'hlc-4a-3',
          heading: '4.A.3 The institution has policies that assure the quality of the credit it accepts in transfer',
          description: 'Transfer credit alignment with program requirements',
          dataSource: 'alignmentMatrix',
          includeTable: true
        }
      ]
    },
    {
      id: 'hlc-4b',
      title: '4.B. The institution demonstrates a commitment to educational achievement and improvement through ongoing assessment',
      criterion: 'Criterion 4.B',
      requiresEvidence: true,
      subsections: [
        {
          id: 'hlc-4b-1',
          heading: '4.B.1 The institution has clearly stated goals for student learning and effective processes for assessment of student learning',
          description: 'Learning outcomes assessment framework',
          dataSource: 'alignmentMatrix',
          includeTable: true,
          includeChart: true,
          narrative: 'Systematic alignment of institutional, program, and course learning outcomes creates a comprehensive assessment framework. Coverage metrics demonstrate completeness of outcome mapping.'
        },
        {
          id: 'hlc-4b-2',
          heading: '4.B.2 The institution assesses achievement of the learning outcomes',
          description: 'Assessment data and evidence of student achievement',
          dataSource: 'programMetrics',
          includeTable: true
        },
        {
          id: 'hlc-4b-3',
          heading: '4.B.3 The institution uses the information gained from assessment to improve student learning',
          description: 'Closing the loop - assessment-driven improvements',
          dataSource: 'gapAnalysis',
          includeTable: true,
          narrative: 'Gap analysis identifies areas requiring curricular enhancement. Documented remediation plans show how assessment findings drive program improvements.'
        }
      ]
    }
  ]
};

/**
 * SACSCOC Standard 8.2: Student Outcomes - Educational Programs
 */
export const SACSCOC_STANDARD_8_2_TEMPLATE: AccreditationTemplate = {
  id: 'sacscoc-8.2',
  name: 'SACSCOC Standard 8.2: Student Outcomes',
  accreditor: 'SACSCOC',
  coverPageConfig: {
    logoRequired: true,
    institutionFields: ['name', 'address', 'chiefAcademicOfficer', 'accreditationLiaison'],
    dateFields: ['reportDate', 'catalogYear']
  },
  sections: [
    {
      id: 'sacscoc-8.2a',
      title: '8.2.a. Program Learning Outcomes',
      criterion: 'Standard 8.2.a',
      requiresEvidence: true,
      subsections: [
        {
          id: 'sacscoc-8.2a-1',
          heading: 'Identification of Expected Student Learning Outcomes',
          description: 'Clearly defined program learning outcomes for each degree program',
          dataSource: 'outcomeData',
          includeTable: true,
          narrative: 'Each degree program has clearly defined, measurable learning outcomes that align with institutional mission and professional/disciplinary standards.'
        },
        {
          id: 'sacscoc-8.2a-2',
          heading: 'Alignment of Outcomes with Institutional Mission',
          description: 'Evidence of how program outcomes support institutional goals',
          dataSource: 'programMetrics',
          includeTable: true
        }
      ]
    },
    {
      id: 'sacscoc-8.2b',
      title: '8.2.b. Assessment of Student Learning',
      criterion: 'Standard 8.2.b',
      requiresEvidence: true,
      subsections: [
        {
          id: 'sacscoc-8.2b-1',
          heading: 'Assessment Methods and Processes',
          description: 'Systematic approach to assessing student achievement of learning outcomes',
          dataSource: 'alignmentMatrix',
          includeTable: true,
          includeChart: true,
          narrative: 'Curriculum mapping demonstrates systematic coverage of program learning outcomes across courses. The I-D-M framework ensures appropriate scaffolding and progression toward outcome mastery.'
        },
        {
          id: 'sacscoc-8.2b-2',
          heading: 'Collection and Analysis of Assessment Data',
          description: 'Evidence of ongoing assessment data collection and analysis',
          dataSource: 'gapAnalysis',
          includeTable: true,
          narrative: 'Regular gap analysis identifies strengths and weaknesses in outcome coverage. Quantitative metrics track alignment percentages and identify unmapped outcomes requiring attention.'
        }
      ]
    },
    {
      id: 'sacscoc-8.2c',
      title: '8.2.c. Use of Assessment Results',
      criterion: 'Standard 8.2.c',
      requiresEvidence: true,
      subsections: [
        {
          id: 'sacscoc-8.2c-1',
          heading: 'Documentation of Program Improvements',
          description: 'Evidence that assessment results inform program changes and improvements',
          dataSource: 'gapAnalysis',
          includeTable: true,
          narrative: 'Gap analysis findings drive targeted curriculum revisions. Documented remediation plans address identified weaknesses, with follow-up analysis confirming improvement.'
        },
        {
          id: 'sacscoc-8.2c-2',
          heading: 'Closing the Assessment Loop',
          description: 'Demonstrated cycle of assessment, analysis, action, and re-assessment',
          dataSource: 'programMetrics',
          includeTable: true,
          includeChart: true
        }
      ]
    }
  ]
};

/**
 * ABET Criterion 3: Student Outcomes (Engineering Programs)
 */
export const ABET_CRITERION_3_TEMPLATE: AccreditationTemplate = {
  id: 'abet-criterion-3',
  name: 'ABET Criterion 3: Student Outcomes',
  accreditor: 'ABET',
  coverPageConfig: {
    logoRequired: true,
    institutionFields: ['name', 'department', 'programName', 'programCoordinator'],
    dateFields: ['reportDate', 'academicYear', 'nextReviewDate']
  },
  sections: [
    {
      id: 'abet-3-outcomes',
      title: 'Student Outcomes',
      criterion: 'Criterion 3',
      requiresEvidence: true,
      subsections: [
        {
          id: 'abet-3-1',
          heading: 'Student Outcome Definitions',
          description: 'Clear articulation of 7 required ABET student outcomes (1-7)',
          dataSource: 'outcomeData',
          includeTable: true,
          narrative: 'Program learning outcomes address all ABET student outcomes (1-7): complex problem solving, engineering design, communication, ethics, teamwork, experimentation, and lifelong learning.'
        },
        {
          id: 'abet-3-2',
          heading: 'Curriculum Mapping to Student Outcomes',
          description: 'Matrix showing which courses address each ABET outcome and at what level',
          dataSource: 'alignmentMatrix',
          includeTable: true,
          includeChart: true,
          narrative: 'Comprehensive curriculum map demonstrates systematic coverage of all ABET outcomes across the program with appropriate I-D-M progression.'
        },
        {
          id: 'abet-3-3',
          heading: 'Assessment of Student Outcomes',
          description: 'Methods and evidence for measuring student attainment of each outcome',
          dataSource: 'gapAnalysis',
          includeTable: true,
          narrative: 'Gap analysis confirms adequate assessment coverage for all ABET outcomes. Multiple assessment points per outcome ensure valid measurement of student achievement.'
        },
        {
          id: 'abet-3-4',
          heading: 'Continuous Improvement',
          description: 'Use of assessment data to drive program improvements',
          dataSource: 'programMetrics',
          includeTable: true
        }
      ]
    }
  ]
};

/**
 * Get all available templates
 */
export const ACCREDITATION_TEMPLATES: Record<string, AccreditationTemplate> = {
  'hlc-criterion-3': HLC_CRITERION_3_TEMPLATE,
  'hlc-criterion-4': HLC_CRITERION_4_TEMPLATE,
  'sacscoc-8.2': SACSCOC_STANDARD_8_2_TEMPLATE,
  'abet-criterion-3': ABET_CRITERION_3_TEMPLATE
};

/**
 * Get template by ID
 */
export function getAccreditationTemplate(templateId: string): AccreditationTemplate | null {
  return ACCREDITATION_TEMPLATES[templateId] || null;
}

/**
 * Get all templates for a specific accreditor
 */
export function getTemplatesByAccreditor(accreditor: string): AccreditationTemplate[] {
  return Object.values(ACCREDITATION_TEMPLATES).filter(t => t.accreditor === accreditor);
}
