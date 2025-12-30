mport { validateInspectionForm } from '../utils/validation';

export class InspectionService {
constructor() {
this.SAFETY_THRESHOLDS = {
scaffolding: {
maxHeight: 10, // meters
requiredGuardrails: true,
maxLoad: 250 // kg per square meter
},
electrical: {
maxVoltage: 50, // volts
requiredGrounding: true,
requiredSignage: true
},
excavation: {
maxDepthWithoutShoring: 1.2, // meters
requiredSloping: true,
requiredAccessEgress: true
},
ppe: {
requiredHardHat: true,
requiredSafetyGlasses: true,
requiredHighVis: true,
requiredGloves: ['cutting', 'welding', 'chemical']
}
};

text
this.INSPECTION_TYPES = [
  'safety',
  'quality',
  'progress',
  'compliance',
  'delivery',
  'handover'
];
}

async performSafetyCheck(inspectionData) {
const validation = validateInspectionForm(inspectionData);
if (!validation.isValid) {
throw new Error(Invalid inspection data: ${Object.keys(validation.errors).join(', ')});
}

text
const issues = [];
const warnings = [];
const passedChecks = [];

// Check required safety equipment
if (inspectionData.ppe) {
  const ppeChecks = this.checkPPECompliance(inspectionData.ppe);
  issues.push(...ppeChecks.issues);
  warnings.push(...ppeChecks.warnings);
  passedChecks.push(...ppeChecks.passed);
}

// Check work area safety
if (inspectionData.workArea) {
  const areaChecks = this.checkWorkAreaSafety(inspectionData.workArea);
  issues.push(...areaChecks.issues);
  warnings.push(...areaChecks.warnings);
  passedChecks.push(...areaChecks.passed);
}

// Check equipment safety
if (inspectionData.equipment) {
  const equipmentChecks = this.checkEquipmentSafety(inspectionData.equipment);
  issues.push(...equipmentChecks.issues);
  warnings.push(...equipmentChecks.warnings);
  passedChecks.push(...equipmentChecks.passed);
}

// Calculate safety score
const safetyScore = this.calculateSafetyScore(passedChecks.length, issues.length, warnings.length);

// Determine overall status
let overallStatus = 'passed';
if (issues.length > 0) {
  overallStatus = 'failed';
} else if (warnings.length > 0) {
  overallStatus = 'requires_attention';
}

return {
  timestamp: new Date().toISOString(),
  inspector: inspectionData.inspectorName,
  type: inspectionData.type,
  overallStatus,
  safetyScore,
  summary: {
    totalChecks: passedChecks.length + issues.length + warnings.length,
    passed: passedChecks.length,
    issues: issues.length,
    warnings: warnings.length
  },
  details: {
    passedChecks,
    issues,
    warnings
  },
  recommendations: this.generateRecommendations(issues, warnings)
};
}

checkPPECompliance(ppeData) {
const issues = [];
const warnings = [];
const passed = [];

text
// Hard hat check
if (ppeData.hardHat) {
  if (ppeData.hardHat.expired || !ppeData.hardHat.certified) {
    issues.push('Hard hat is expired or not certified');
  } else {
    passed.push('Hard hat compliant');
  }
} else {
  issues.push('Hard hat not worn');
}

// Safety glasses check
if (ppeData.safetyGlasses) {
  if (ppeData.safetyGlasses.scratched || !ppeData.safetyGlasses.impactRated) {
    warnings.push('Safety glasses may need replacement');
  } else {
    passed.push('Safety glasses compliant');
  }
} else if (this.requiresEyeProtection(ppeData.workType)) {
  issues.push('Safety glasses required for this work type');
}

// High visibility vest check
if (ppeData.highVis) {
  if (ppeData.highVis.dirty || !ppeData.highVis.reflective) {
    warnings.push('High visibility vest needs cleaning or replacement');
  } else {
    passed.push('High visibility vest compliant');
  }
} else {
  issues.push('High visibility vest not worn');
}

// Gloves check
if (ppeData.gloves) {
  const requiredGloves = this.getRequiredGloves(ppeData.workType);
  if (requiredGloves.length > 0 && !ppeData.gloves.type) {
    issues.push(`Required gloves not worn: ${requiredGloves.join(', ')}`);
  } else {
    passed.push('Gloves compliant');
  }
}

return { issues, warnings, passed };
}

checkWorkAreaSafety(workArea) {
const issues = [];
const warnings = [];
const passed = [];

text
// Housekeeping check
if (workArea.housekeeping === 'poor') {
  issues.push('Poor housekeeping - trip hazards present');
} else if (workArea.housekeeping === 'fair') {
  warnings.push('Housekeeping needs improvement');
} else {
  passed.push('Good housekeeping maintained');
}

// Access and egress check
if (!workArea.clearAccessEgress) {
  issues.push('Access and egress routes obstructed');
} else {
  passed.push('Clear access and egress maintained');
}

// Emergency equipment check
if (workArea.emergencyEquipment) {
  if (!workArea.emergencyEquipment.fireExtinguisher) {
    warnings.push('Fire extinguisher not available or not accessible');
  } else {
    passed.push('Fire extinguisher available and accessible');
  }

  if (!workArea.emergencyEquipment.firstAidKit) {
    warnings.push('First aid kit not available or not accessible');
  } else {
    passed.push('First aid kit available and accessible');
  }
}

// Signage check
if (!workArea.properSignage) {
  warnings.push('Safety signage missing or inadequate');
} else {
  passed.push('Proper safety signage in place');
}

return { issues, warnings, passed };
}

checkEquipmentSafety(equipment) {
const issues = [];
const warnings = [];
const passed = [];

text
equipment.forEach((item) => {
  // Inspection date check
  if (item.lastInspection) {
    const lastInspection = new Date(item.lastInspection);
    const daysSinceInspection = Math.floor((Date.now() - lastInspection) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInspection > 90) {
      issues.push(`${item.name}: Inspection overdue (${daysSinceInspection} days)`);
    } else if (daysSinceInspection > 60) {
      warnings.push(`${item.name}: Inspection due soon (${daysSinceInspection} days)`);
    } else {
      passed.push(`${item.name}: Recently inspected`);
    }
  } else {
    warnings.push(`${item.name}: No inspection record found`);
  }

  // Certification check
  if (item.requiresCertification && !item.certificationValid) {
    issues.push(`${item.name}: Certification invalid or missing`);
  } else if (item.requiresCertification) {
    passed.push(`${item.name}: Certification valid`);
  }

  // Physical condition check
  if (item.condition === 'poor') {
    issues.push(`${item.name}: Poor condition - remove from service`);
  } else if (item.condition === 'fair') {
    warnings.push(`${item.name}: Condition requires monitoring`);
  } else {
    passed.push(`${item.name}: Good condition`);
  }
});

return { issues, warnings, passed };
}

calculateSafetyScore(passed, issues, warnings) {
const total = passed + issues + warnings;
if (total === 0) return 100;

text
let score = (passed / total) * 100;

// Deductions for issues and warnings
score -= (issues * 10); // -10 points per issue
score -= (warnings * 5); // -5 points per warning

return Math.max(0, Math.min(100, Math.round(score)));
}

generateRecommendations(issues, warnings) {
const recommendations = [];

text
issues.forEach(issue => {
  switch (true) {
    case issue.includes('Hard hat'):
      recommendations.push('Immediately provide certified hard hats to all workers');
      break;
    case issue.includes('Safety glasses'):
      recommendations.push('Stop work until proper eye protection is provided');
      break;
    case issue.includes('Access and egress'):
      recommendations.push('Clear all access and egress routes immediately');
      break;
    case issue.includes('Inspection overdue'):
      recommendations.push('Remove equipment from service until inspected');
      break;
    default:
      recommendations.push(`Address: ${issue}`);
  }
});

warnings.forEach(warning => {
  switch (true) {
    case warning.includes('needs cleaning'):
      recommendations.push('Clean or replace high visibility clothing');
      break;
    case warning.includes('Housekeeping'):
      recommendations.push('Schedule immediate cleanup of work area');
      break;
    case warning.includes('Signage'):
      recommendations.push('Install proper safety signage');
      break;
    case warning.includes('due soon'):
      recommendations.push('Schedule equipment inspection');
      break;
    default:
      recommendations.push(`Monitor: ${warning}`);
  }
});

return recommendations;
}

requiresEyeProtection(workType) {
const hazardousWork = [
'grinding',
'welding',
'cutting',
'chipping',
'chemical_handling'
];
return hazardousWork.includes(workType);
}

getRequiredGloves(workType) {
const gloveRequirements = {
'cutting': ['cut_resistant'],
'welding': ['heat_resistant', 'leather'],
'chemical_handling': ['chemical_resistant'],
'general': ['general_purpose']
};

text
return gloveRequirements[workType] || [];
}

async generateInspectionReport(inspectionResults, template = 'standard') {
const report = {
metadata: {
generatedAt: new Date().toISOString(),
template,
version: '1.0'
},
overview: {
projectId: inspectionResults.projectId,
inspector: inspectionResults.inspectorName,
date: inspectionResults.date,
type: inspectionResults.type,
overallStatus: inspectionResults.overallStatus,
safetyScore: inspectionResults.safetyScore
},
executiveSummary: {
status: inspectionResults.overallStatus === 'passed' ? 'Compliant' : 'Non-Compliant',
mainFindings: inspectionResults.details.issues.slice(0, 3),
immediateActions: inspectionResults.recommendations.filter(rec =>
rec.includes('Immediately') || rec.includes('Stop work')
)
},
detailedFindings: {
passed: inspectionResults.details.passedChecks.map(check => ({
item: check,
status: 'compliant'
})),
issues: inspectionResults.details.issues.map(issue => ({
item: issue,
severity: 'high',
requirement: this.getRegulatoryRequirement(issue)
})),
warnings: inspectionResults.details.warnings.map(warning => ({
item: warning,
severity: 'medium',
suggestion: 'Address within 7 days'
}))
},
attachments: inspectionResults.photos || []
};

text
return report;
}

getRegulatoryRequirement(issue) {
const requirements = {
'Hard hat': 'OSHA 1926.100(a) - Head protection',
'Safety glasses': 'OSHA 1926.102(a)(1) - Eye and face protection',
'High visibility vest': 'ANSI/ISEA 107-2020 - High-visibility apparel',
'Access and egress': 'OSHA 1926.501(b)(1) - Fall protection',
'Fire extinguisher': 'OSHA 1910.157(c)(1) - Portable fire extinguishers'
};

text
for (const [key, requirement] of Object.entries(requirements)) {
  if (issue.includes(key)) {
    return requirement;
  }
}

return 'General duty clause - OSHA 5(a)(1)';
}
}
