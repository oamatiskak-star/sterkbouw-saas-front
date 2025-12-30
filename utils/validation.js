export const validateProjectForm = (data) => {
const errors = {};

if (!data.name || data.name.trim().length < 3) {
errors.name = 'Project name must be at least 3 characters';
}

if (!data.address || data.address.trim().length === 0) {
errors.address = 'Address is required';
}

if (!data.clientName || data.clientName.trim().length === 0) {
errors.clientName = 'Client name is required';
}

if (!data.startDate || isNaN(Date.parse(data.startDate))) {
errors.startDate = 'Valid start date is required';
}

if (data.endDate && Date.parse(data.endDate) < Date.parse(data.startDate)) {
errors.endDate = 'End date cannot be before start date';
}

if (!data.budget || isNaN(data.budget) || parseFloat(data.budget) <= 0) {
errors.budget = 'Valid budget amount is required';
}

return {
isValid: Object.keys(errors).length === 0,
errors
};
};

export const validateInspectionForm = (data) => {
const errors = {};

if (!data.projectId) {
errors.projectId = 'Project selection is required';
}

if (!data.inspectorName || data.inspectorName.trim().length < 2) {
errors.inspectorName = 'Inspector name is required';
}

if (!data.date || isNaN(Date.parse(data.date))) {
errors.date = 'Valid inspection date is required';
}

if (data.date && new Date(data.date) > new Date()) {
errors.date = 'Inspection date cannot be in the future';
}

if (!data.type || !['safety', 'quality', 'progress', 'compliance'].includes(data.type)) {
errors.type = 'Valid inspection type is required';
}

if (data.notes && data.notes.length > 2000) {
errors.notes = 'Notes cannot exceed 2000 characters';
}

return {
isValid: Object.keys(errors).length === 0,
errors
};
};

export const validateMaterialForm = (data) => {
const errors = {};

if (!data.name || data.name.trim().length < 2) {
errors.name = 'Material name is required';
}

if (!data.supplier || data.supplier.trim().length < 2) {
errors.supplier = 'Supplier name is required';
}

if (!data.quantity || isNaN(data.quantity) || parseFloat(data.quantity) <= 0) {
errors.quantity = 'Valid quantity is required';
}

if (!data.unit || !['kg', 'm', 'm²', 'm³', 'piece', 'liter'].includes(data.unit)) {
errors.unit = 'Valid unit is required';
}

if (!data.deliveryDate || isNaN(Date.parse(data.deliveryDate))) {
errors.deliveryDate = 'Valid delivery date is required';
}

return {
isValid: Object.keys(errors).length === 0,
errors
};
};

export const validateLoginForm = (data) => {
const errors = {};

if (!data.email || !/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(data.email)) {
errors.email = 'Valid email address is required';
}

if (!data.password || data.password.length < 6) {
errors.password = 'Password must be at least 6 characters';
}

return {
isValid: Object.keys(errors).length === 0,
errors
};
};
