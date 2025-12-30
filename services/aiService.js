// services/aiService.js
export const generateReport = async (projectId, prompt) => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`# Generated Report for Project ${projectId}

**Prompt:** ${prompt}

**Executive Summary:**
This is a mock AI-generated report. In a real implementation, this would connect to an AI service like OpenAI, Anthropic, or a custom model.

**Key Findings:**
1. Project progress is on track
2. Budget utilization is at 75%
3. Resource allocation needs optimization

**Recommendations:**
- Review resource allocation
- Schedule mid-project review
- Update risk assessment`);
    }, 1500);
  });
};
