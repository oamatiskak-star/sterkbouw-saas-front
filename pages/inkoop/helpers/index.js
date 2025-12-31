// pages/inkoop/helpers/index.js

// Helper functies voor prijsberekeningen
export const getSupplierQuote = (request, supplierId) => {
  if (!request || !Array.isArray(request.responses)) {
    return 0
  }

  const response = request.responses.find(
    (r) => r.supplier_id === supplierId
  )

  return typeof response?.total_price === 'number'
    ? response.total_price
    : 0
}

export const calculateTargetPrice = (request, supplier) => {
  // Vereenvoudigde logica voor demo
  const basePrice = getSupplierQuote(request, supplier.id)
  return basePrice * 0.9 // 10% korting
}

export const generateNegotiationStrategy = async (request, supplier) => {
  // Mock data voor demo
  return {
    type: "volume_discount",
    target_price: calculateTargetPrice(request, supplier),
    steps: [
      "Vraag volume korting aan",
      "Stel betere betalingsvoorwaarden voor",
      "Vraag kortere levertijd",
      "Toon alternatieve leveranciers"
    ],
    opening_message: `Geachte heer/mevrouw,
    
Wij zijn zeer geïnteresseerd in uw offerte voor ${request.description}.
Gezien de omvang van dit project en onze toekomstige samenwerking, vragen wij u om een volume korting van 10%.

Graag ontvangen wij uw reactie binnen 48 uur.

Met vriendelijke groet,
Team Inkoop Sterkbouw`
  }
}

// Cashflow helpers
export const calculateUpfrontPayment = (chapterId) => {
  // Vereenvoudigde logica
  const rates = {
    'A': 30, 'B': 40, 'C': 25, 'D': 35, 'E': 20,
    'F': 15, 'G': 30, 'H': 25, 'I': 40
  }
  return rates[chapterId] || 25
}

export const calculateROIMonths = (chapterId, amount) => {
  const roiFactors = {
    'A': 3, 'B': 4, 'C': 6, 'D': 5, 'E': 4,
    'F': 2, 'G': 3, 'H': 5, 'I': 8
  }
  return roiFactors[chapterId] || 4
}

export const calculateRiskLevel = (chapterId) => {
  const risks = {
    'A': 'laag', 'B': 'hoog', 'C': 'middel', 'D': 'hoog', 'E': 'middel',
    'F': 'laag', 'G': 'middel', 'H': 'laag', 'I': 'hoog'
  }
  return risks[chapterId] || 'middel'
}

export const calculateOptimalTiming = (chapterId) => {
  const timing = {
    'A': 'project start',
    'B': 'week 2-3',
    'C': 'week 4-6',
    'D': 'week 6-8',
    'E': 'week 10-12',
    'F': 'week 14-16',
    'G': 'week 8-10',
    'H': 'week 18-20',
    'I': 'volgens planning'
  }
  return timing[chapterId] || 'volgens planning'
}

export const generateCashflowRecommendations = (chapterId, amount) => {
  return [
    "Voorschot onderhandelen naar 20%",
    "Betalingsvoorwaarden uitstellen naar 60 dagen",
    "Stroomlijn leveringen volgens planning",
    "Monitor materialen prijzen"
  ]
}

// Supplier performance helpers
export const calculateAvgResponseTime = (history) => {
  if (!history || history.length === 0) return 48
  return Math.round(history.reduce((sum, h) => sum + (h.response_hours || 48), 0) / history.length)
}

export const calculateOnTimeDeliveryRate = (history) => {
  if (!history || history.length === 0) return "95%"
  const onTime = history.filter(h => h.delivered_on_time).length
  return `${Math.round((onTime / history.length) * 100)}%`
}

export const calculatePriceAccuracy = (history) => {
  if (!history || history.length === 0) return "98%"
  const accurate = history.filter(h => h.price_accuracy === 'high').length
  return `${Math.round((accurate / history.length) * 100)}%`
}

export const calculateQualityScore = (history) => {
  if (!history || history.length === 0) return 4.5
  const totalScore = history.reduce((sum, h) => sum + (h.quality_score || 4), 0)
  return Math.round((totalScore / history.length) * 10) / 10
}

export const calculateOverallSupplierRating = (history) => {
  if (!history || history.length === 0) return "B"
  const scores = {
    'A': 0, 'B': 0, 'C': 0, 'D': 0
  }
  history.forEach(h => {
    scores[h.rating] = (scores[h.rating] || 0) + 1
  })
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
}

// Order helpers
export const calculateOrderTotal = (request, supplier) => {
  return getSupplierQuote(request, supplier.id) || 10000
}

export const calculateDeliveryDate = (deadline) => {
  const date = new Date(deadline)
  date.setDate(date.getDate() + 14) // 2 weken na deadline
  return date.toISOString()
}

export const getProjectAddress = (project) => {
  return project?.address || "Hoofdstraat 123, 1234 AB Amsterdam"
}

export const generateOrderInstructions = (request, supplier) => {
  return `Bestelling voor ${request.description}
  
Levering volgens afspraak:
- Alle materialen voorzien van certificaten
- Leverbonnen in drievoud
- Facturatie naar inkoop@sterkbouw.nl
- Referentie: ${request.project?.project_number || 'PROJ-2024-001'}`
}

// Planning helpers
export const parsePlanningData = (planData) => {
  // Mock planning data
  return [
    { task: "Fundering", start: "2024-01-01", end: "2024-01-14", critical: true },
    { task: "Betonwerk", start: "2024-01-15", end: "2024-02-15", critical: true },
    { task: "Dakwerk", start: "2024-02-16", end: "2024-03-15", critical: false },
    { task: "Afwerking", start: "2024-03-16", end: "2024-04-30", critical: true }
  ]
}

export const linkDeliveriesToPlanning = (plan, orders) => {
  // Mock implementatie
  return plan.map(task => ({
    ...task,
    deliveries: orders.filter(o => o.delivery_date && 
      new Date(o.delivery_date) >= new Date(task.start) &&
      new Date(o.delivery_date) <= new Date(task.end)
    )
  }))
}

export const analyzeCriticalPath = (plan) => {
  return plan.filter(task => task.critical).map(task => task.task)
}

export const identifyRiskPoints = (plan) => {
  return plan
    .filter(task => task.deliveries && task.deliveries.length === 0)
    .map(task => `${task.task}: Geen leveringen gepland`)
}

// Status helpers
export const getStatusColor = (status) => {
  const colors = {
    'draft': 'secondary',
    'sent': 'info',
    'received': 'warning',
    'in_review': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'negotiating': 'purple',
    'ordered': 'teal'
  }
  return colors[status] || 'secondary'
}

export const getStatusText = (status) => {
  const texts = {
    'draft': 'Concept',
    'sent': 'Verzonden',
    'received': 'Ontvangen',
    'in_review': 'In Beoordeling',
    'approved': 'Goedgekeurd',
    'rejected': 'Afgewezen',
    'negotiating': 'In Onderhandeling',
    'ordered': 'Besteld'
  }
  return texts[status] || status
}

// Mock data functions
export const getMockProjects = () => [
  { id: '1', name: 'Woningbouw Schildersbuurt', project_number: 'PROJ-2024-001', status: 'active', start_date: '2024-01-01' },
  { id: '2', name: 'Kantoorrenovatie Centrum', project_number: 'PROJ-2024-002', status: 'active', start_date: '2024-02-01' },
  { id: '3', name: 'Schooluitbreiding Noord', project_number: 'PROJ-2024-003', status: 'active', start_date: '2024-03-01' }
]

export const getMockSuppliers = () => [
  { id: '1', name: 'BetonUnie BV', rating: 'A', expertise: ['C', 'B'], email: 'info@betonunie.nl' },
  { id: '2', name: 'Staalconstructies De Vries', rating: 'A', expertise: ['D'], email: 'offerte@devriesstaal.nl' },
  { id: '3', name: 'Houthandel Van Dam', rating: 'B', expertise: ['D', 'F'], email: 'verkopen@vandamhout.nl' },
  { id: '4', name: 'Dakwerken Peters', rating: 'B', expertise: ['E'], email: 'info@dakwerkenpeters.nl' },
  { id: '5', name: 'Installatiebedrijf Jansen', rating: 'A', expertise: ['G'], email: 'offerte@janseninstallatie.nl' }
]

export const getMockOrders = () => [
  { id: '1', order_number: 'ORD-2024-001', project_id: '1', supplier_id: '1', total_amount: 25000, status: 'confirmed', created_at: '2024-01-15' },
  { id: '2', order_number: 'ORD-2024-002', project_id: '1', supplier_id: '2', total_amount: 18000, status: 'pending', created_at: '2024-01-20' },
  { id: '3', order_number: 'ORD-2024-003', project_id: '2', supplier_id: '5', total_amount: 32000, status: 'delivered', created_at: '2024-02-10' }
]

export const getMockPriceRequests = () => [
  { 
    id: '1', 
    project_id: '1', 
    chapter_id: 'C',
    description: 'Betonfundering woningbouw',
    status: 'received',
    deadline: '2024-02-15',
    sent_at: '2024-01-10',
    responses: [
      { supplier_id: '1', total_price: 25000, received_at: '2024-01-12' },
      { supplier_id: '3', total_price: 27000, received_at: '2024-01-13' }
    ]
  }
]

// Email helpers
export const generateNegotiationEmail = async (form) => {
  return `Beste leverancier,

Hierbij ons onderhandelingsvoorstel voor offerte ${form.request_id}.

Doelprijs: €${form.target_price}
Strategie: ${form.negotiation_strategy}
Bericht: ${form.message}

Wij verwachten uw reactie binnen ${form.deadline_hours} uur.

Met vriendelijke groet,
Team Inkoop`
}

export const generateOpeningMessage = (request, supplier) => {
  return `Beste ${supplier.name},
  
Betreft: onderhandeling voor ${request.description}
Wij zijn positief over uw offerte en willen graag verder praten over de voorwaarden.`
}

// Market data
export const getMarketAverage = (chapterId) => {
  const averages = {
    'A': 15000, 'B': 35000, 'C': 25000, 'D': 45000, 'E': 20000,
    'F': 18000, 'G': 30000, 'H': 15000, 'I': 50000
  }
  return averages[chapterId] || 25000
}

export const getSupplierHistory = (supplierId) => {
  // Mock historie
  return {
    volume: 250000,
    loyalty_years: 3,
    rating: 'A'
  }
}
