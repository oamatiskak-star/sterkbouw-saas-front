export const ERROR_MAP = {
  CONTEXT_REQUIRED: {
    title: "Context ontbreekt",
    message: "Selecteer eerst een project en workflow."
  },
  NOT_ALLOWED: {
    title: "Geen toegang",
    message: "Je hebt geen rechten om deze actie uit te voeren."
  },
  UPLOAD_FAILED: {
    title: "Upload mislukt",
    message: "Het bestand kon niet worden verwerkt."
  },
  WORKFLOW_CONTEXT_REQUIRED: {
    title: "Workflow vereist",
    message: "Deze actie moet binnen een workflow plaatsvinden."
  },
  DEFAULT: {
    title: "Fout",
    message: "Er is iets misgegaan."
  }
}

export function mapError(code) {
  return ERROR_MAP[code] || ERROR_MAP.DEFAULT
}
