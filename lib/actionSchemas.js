export const actionSchemas = {
  "calculaties:bouw": {
    title: "Bouwcalculatie",
    blocks: ["project", "upload", "parameters", "start", "status", "result"]
  },
  "calculaties:ew": {
    title: "E en W calculatie",
    blocks: ["project", "upload", "parameters", "start", "status", "result"]
  },
  "architecten:bouwtekening": {
    title: "Genereer bouwtekening",
    blocks: ["project", "upload", "start", "status", "result"]
  },
  "planning:genereer": {
    title: "Genereer planning",
    blocks: ["project", "start", "status", "result"]
  },
  "documenten:upload": {
    title: "Bestanden uploaden",
    blocks: ["project", "upload", "status"]
  }
}
