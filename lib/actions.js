export const actions = {
  "calculaties:bouw": { task:"calc_bouw", result:"rapport" },
  "calculaties:ew": { task:"calc_ew", result:"rapport" },
  "calculaties:stabu": { task:"calc_stabu", result:"rapport" },
  "calculaties:fixed": { task:"calc_fixed", result:"rapport" },

  "architecten:bouwtekening": { task:"gen_bouwtekening", result:"pdf" },
  "architecten:installatie": { task:"gen_installatietekening", result:"pdf" },
  "architecten:bim": { task:"gen_bim", result:"ifc" },

  "engineering:meetstaat": { task:"gen_meetstaat", result:"xlsx" },

  "planning:genereer": { task:"gen_planning", result:"pdf" },

  "documenten:upload": { task:"upload", result:"files" },

  "analyse:risico": { task:"analyse_risico", result:"rapport" },
  "analyse:cashflow": { task:"analyse_cashflow", result:"rapport" }
}
