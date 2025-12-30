export const calculateConcreteVolume = (length, width, thickness) => {
if ([length, width, thickness].some(dim => isNaN(dim) || dim <= 0)) {
throw new Error('All dimensions must be positive numbers');
}
return length * width * thickness;
};

export const calculateRebarWeight = (length, diameter, quantity = 1) => {
if ([length, diameter, quantity].some(val => isNaN(val) || val <= 0)) {
throw new Error('All values must be positive numbers');
}
// Weight in kg: (diameter^2 * length) / 162 (standard formula)
const weightPerBar = (Math.pow(diameter, 2) * length) / 162;
return weightPerBar * quantity;
};

export const calculateBrickQuantity = (wallLength, wallHeight, brickLength, brickHeight, mortarThickness = 0.01) {
if ([wallLength, wallHeight, brickLength, brickHeight].some(dim => isNaN(dim) || dim <= 0)) {
throw new Error('All dimensions must be positive numbers');
}

const brickLengthWithMortar = brickLength + mortarThickness;
const brickHeightWithMortar = brickHeight + mortarThickness;

const bricksPerRow = Math.ceil(wallLength / brickLengthWithMortar);
const rows = Math.ceil(wallHeight / brickHeightWithMortar);

return bricksPerRow * rows;
};

export const calculatePaintCoverage = (area, coats, coveragePerLiter) => {
if ([area, coats, coveragePerLiter].some(val => isNaN(val) || val <= 0)) {
throw new Error('All values must be positive numbers');
}
return (area * coats) / coveragePerLiter;
};

export const calculateLaborHours = (taskComplexity, area, skillFactor = 1.0) => {
if ([taskComplexity, area, skillFactor].some(val => isNaN(val) || val <= 0)) {
throw new Error('All values must be positive numbers');
}

const baseHoursPerSqM = {
'simple': 0.5,
'medium': 1.0,
'complex': 2.0,
'very_complex': 4.0
};

const baseRate = baseHoursPerSqM[taskComplexity] || 1.0;
return (area * baseRate) / skillFactor;
};

export const calculateProjectProgress = (tasks) => {
if (!Array.isArray(tasks) || tasks.length === 0) {
return 0;
}

const completedTasks = tasks.filter(task => task.status === 'completed');
const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 1), 0);
const completedWeight = completedTasks.reduce((sum, task) => sum + (task.weight || 1), 0);

return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

export const calculateCostEstimate = (materials, laborHours, hourlyRate, overheadPercentage = 15) {
const materialCost = materials.reduce((sum, material) => {
return sum + (material.quantity * material.unitPrice);
}, 0);

const laborCost = laborHours * hourlyRate;
const subtotal = materialCost + laborCost;
const overhead = subtotal * (overheadPercentage / 100);

return {
materialCost,
laborCost,
overhead,
total: subtotal + overhead,
breakdown: {
materials: materialCost,
labor: laborCost,
overhead: overhead
}
};
};
