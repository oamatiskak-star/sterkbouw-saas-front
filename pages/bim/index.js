import { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"
import axios from "axios"
import {
  Container,
  Grid,
  Card,
  Button,
  Text,
  Group,
  Stack,
  LoadingOverlay,
  Alert,
  Tabs,
  Progress,
  Badge,
  Modal,
  Image,
  Select,
  NumberInput,
  TextInput,
  Switch,
  SimpleGrid,
  Paper,
  Title,
  ActionIcon,
  Tooltip,
  Center,
  Box,
  Flex,
  Collapse,
  Divider,
  List,
  ThemeIcon
} from '@mantine/core'
import { 
  Icon3dCubeSphere,
  IconAlertCircle,
  IconArrowsMaximize,
  IconBox,
  IconBrandBlender,
  IconBuilding,
  IconCalculator,
  IconCheck,
  IconCloudUpload,
  IconColorSwatch,
  IconCopy,
  IconCube,
  IconCubeSend,
  IconCurrencyEuro,
  IconDownload,
  IconEye,
  IconHistory,
  IconLayoutGrid,
  IconPackage, 
  IconPhoto,
  IconProgress,
  IconRefresh,
  IconRobot,
  IconRotate,
  IconRuler,
  IconSettings,
  IconTrash,
  IconTrees,
  IconUpload,
  IconZoomIn
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/router'

export default function BIMPagina() {
  const router = useRouter()
  const { projectId } = router.query
  notifications.show({
  title: 'Fout',
  message: 'Kon project niet laden',
  color: 'red'
})
  
  // State management
  const [loading, setLoading] = useState(false)
  const [project, setProject] = useState(null)
  const [calculaties, setCalculaties] = useState([])
  const [selectedCalculatie, setSelectedCalculatie] = useState(null)
  const [renders, setRenders] = useState([])
  const [materials, setMaterials] = useState(null)
  const [activeTab, setActiveTab] = useState("3d-render")
  
  // Render settings
  const [renderSettings, setRenderSettings] = useState({
    type: 'interior',
    quality: 'medium',
    viewType: 'perspective',
    resolution: '1920x1080',
    includeMaterials: true,
    includeFurniture: false,
    lighting: 'studio',
    cameraAngle: '45'
  })
  
  // Material extraction
  const [extractedMaterials, setExtractedMaterials] = useState(null)
  const [materialAnalysis, setMaterialAnalysis] = useState(null)
  
  // Active render job
  const [activeRenderJob, setActiveRenderJob] = useState(null)
  const [renderProgress, setRenderProgress] = useState(0)
  const [renderModalOpen, setRenderModalOpen] = useState(false)
  
  // References
  const fileInputRef = useRef(null)
  const progressIntervalRef = useRef(null)

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      fetchProjectData()
      fetchCalculaties()
      fetchRenders()
    }
  }, [projectId])

  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Fetch project data
  const fetchProjectData = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (error) throw error
      setProject(data)
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: 'Kon project niet laden',
        color: 'red'
      })
    }
  }

  // Fetch calculaties
  const fetchCalculaties = async () => {
    try {
      const { data, error } = await supabase
        .from('calculaties')
        .select('id, title, created_at, total_amount')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCalculaties(data || [])
      if (data && data.length > 0) {
        setSelectedCalculatie(data[0])
      }
    } catch (error) {
      console.error('Error fetching calculaties:', error)
    }
  }

  // Fetch existing renders
  const fetchRenders = async () => {
    try {
      const { data, error } = await supabase
        .from('bim_render_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      setRenders(data || [])
    } catch (error) {
      console.error('Error fetching renders:', error)
    }
  }

  // Extract materials from calculatie
  const handleExtractMaterials = async () => {
    if (!selectedCalculatie) {
      notifications.show({
        title: 'Fout',
        message: 'Selecteer eerst een calculatie',
        color: 'red'
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/bim/extract-materials', {
        calculatie_id: selectedCalculatie.id,
        include_pricing: true
      })

      if (response.data.success) {
        setExtractedMaterials(response.data.analysis.materials)
        setMaterialAnalysis(response.data.analysis)
        notifications.show({
          title: 'Success',
          message: `Materialen geëxtraheerd (${response.data.analysis.materials.length} materialen)`,
          color: 'green'
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: error.response?.data?.error || 'Materialen extractie mislukt',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate 3D render
  const handleGenerateRender = async () => {
    if (!selectedCalculatie || !extractedMaterials) {
      notifications.show({
        title: 'Fout',
        message: 'Extraheer eerst materialen uit een calculatie',
        color: 'red'
      })
      return
    }

    setLoading(true)
    setRenderProgress(0)
    setRenderModalOpen(true)

    try {
      const response = await axios.post('/api/bim/generate-render', {
        project_id: projectId,
        calculatie_id: selectedCalculatie.id,
        render_type: renderSettings.type,
        quality: renderSettings.quality,
        view_type: renderSettings.viewType
      })

      if (response.data.success) {
        const jobId = response.data.job_id
        setActiveRenderJob({
          id: jobId,
          estimated_completion: response.data.estimated_completion
        })

        // Start progress polling
        startProgressPolling(jobId)
        
        notifications.show({
          title: 'Render gestart',
          message: '3D render wordt gegenereerd...',
          color: 'blue'
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: error.response?.data?.error || 'Render generatie mislukt',
        color: 'red'
      })
      setRenderModalOpen(false)
      setLoading(false)
    }
  }

  // Poll render progress
  const startProgressPolling = (jobId) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/bim/generate-render/status/${jobId}`)
        
        if (response.data.success) {
          const job = response.data.job
          
          // Update progress based on status
          if (job.status === 'processing') {
            setRenderProgress(50)
          } else if (job.status === 'completed') {
            setRenderProgress(100)
            clearInterval(progressIntervalRef.current)
            
            // Refresh renders list
            fetchRenders()
            
            notifications.show({
              title: 'Render voltooid!',
              message: '3D render is klaar voor gebruik',
              color: 'green'
            })
            
            setTimeout(() => {
              setRenderModalOpen(false)
              setLoading(false)
              setActiveRenderJob(null)
            }, 2000)
            
          } else if (job.status === 'failed') {
            setRenderProgress(0)
            clearInterval(progressIntervalRef.current)
            
            notifications.show({
              title: 'Render mislukt',
              message: job.error || 'Onbekende fout',
              color: 'red'
            })
            
            setRenderModalOpen(false)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error polling render status:', error)
      }
    }, 3000)
  }

  // Download render
  const handleDownloadRender = async (renderUrl, renderName) => {
    try {
      const link = document.createElement('a')
      link.href = renderUrl
      link.download = `${renderName || 'render'}_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      notifications.show({
        title: 'Download mislukt',
        message: error.message,
        color: 'red'
      })
    }
  }

  // Delete render
  const handleDeleteRender = async (renderId) => {
    if (!confirm('Weet je zeker dat je deze render wilt verwijderen?')) return

    try {
      const response = await axios.delete(`/api/bim/generate-render/${renderId}`)
      
      if (response.data.success) {
        notifications.show({
          title: 'Render verwijderd',
          message: 'Render succesvol verwijderd',
          color: 'green'
        })
        fetchRenders()
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: error.response?.data?.error || 'Verwijderen mislukt',
        color: 'red'
      })
    }
  }

  // Render settings options
  const renderTypes = [
    { value: 'interior', label: 'Interieur', description: 'Binnenruimte render' },
    { value: 'exterior', label: 'Exterieur', description: 'Buitenkant gebouw' },
    { value: 'topdown', label: 'Vogelvlucht', description: 'Bovenaanzicht' },
    { value: 'section', label: 'Doorsnede', description: 'Dwarsdoorsnede' }
  ]

  const qualityOptions = [
    { value: 'low', label: 'Laag (concept)', description: 'Snelle preview' },
    { value: 'medium', label: 'Medium (standaard)', description: 'Goede kwaliteit' },
    { value: 'high', label: 'Hoog (presentatie)', description: 'Hoge kwaliteit' },
    { value: 'ultra', label: 'Ultra (print)', description: 'Beste kwaliteit' }
  ]

  const viewTypeOptions = [
    { value: 'perspective', label: 'Perspectief', description: 'Natuurlijk zicht' },
    { value: 'orthographic', label: 'Orthografisch', description: 'Technische tekening' },
    { value: 'isometric', label: 'Isometrisch', description: '3D technisch' }
  ]

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Group position="apart" mb="xl">
        <div>
          <Title order={1}>BIM & 3D Visualisatie</Title>
          <Text color="dimmed" size="sm">
            Genereer 3D renders op basis van calculatie materialen
          </Text>
        </div>
        <Group>
          <Button 
            leftIcon={<IconHistory size={18} />}
            variant="light"
            onClick={fetchRenders}
          >
            Vernieuw
          </Button>
          {project && (
            <Badge size="lg" variant="filled">
              {project.title}
            </Badge>
          )}
        </Group>
      </Group>

      {/* Main Tabs */}
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="3d-render" icon={<Icon3dCubeSphere size={16} />}>
            3D Render
          </Tabs.Tab>
          <Tabs.Tab value="materials" icon={<IconMaterials size={16} />}>
            Materialen
          </Tabs.Tab>
          <Tabs.Tab value="library" icon={<IconLayoutGrid size={16} />}>
            Render Library
          </Tabs.Tab>
          <Tabs.Tab value="settings" icon={<IconSettings size={16} />}>
            Instellingen
          </Tabs.Tab>
        </Tabs.List>

        {/* 3D Render Tab */}
        <Tabs.Panel value="3d-render" pt="md">
          <Grid>
            {/* Left Column - Settings */}
            <Grid.Col span={4}>
              <Card withBorder shadow="sm">
                <Card.Section withBorder p="md">
                  <Title order={4}><IconCalculator size={20} /> Calculatie Selectie</Title>
                </Card.Section>
                
                <Select
                  label="Selecteer calculatie"
                  placeholder="Kies een calculatie"
                  value={selectedCalculatie?.id}
                  onChange={(value) => {
                    const calc = calculaties.find(c => c.id === value)
                    setSelectedCalculatie(calc)
                  }}
                  data={calculaties.map(c => ({
                    value: c.id,
                    label: `${c.title} (€${c.total_amount?.toFixed(2) || '0.00'})`
                  }))}
                  mb="md"
                />

                <Button
                  fullWidth
                  leftIcon={<IconBox size={18} />}
                  onClick={handleExtractMaterials}
                  loading={loading && !activeRenderJob}
                  disabled={!selectedCalculatie}
                  mb="md"
                >
                  Materialen Extraheren
                </Button>

                {extractedMaterials && (
                  <Alert 
                    icon={<IconCheck size={16} />} 
                    title="Materialen geladen"
                    color="green"
                    mb="md"
                  >
                    {extractedMaterials.length} materialen klaar voor rendering
                  </Alert>
                )}

                <Divider my="md" />

                <Card.Section withBorder p="md">
                  <Title order={4}><IconSettings size={20} /> Render Instellingen</Title>
                </Card.Section>

                <Select
                  label="Render Type"
                  value={renderSettings.type}
                  onChange={(value) => setRenderSettings({...renderSettings, type: value})}
                  data={renderTypes.map(t => ({ value: t.value, label: t.label }))}
                  mb="sm"
                />

                <Select
                  label="Kwaliteit"
                  value={renderSettings.quality}
                  onChange={(value) => setRenderSettings({...renderSettings, quality: value})}
                  data={qualityOptions.map(q => ({ value: q.value, label: q.label }))}
                  mb="sm"
                />

                <Select
                  label="Weergave Type"
                  value={renderSettings.viewType}
                  onChange={(value) => setRenderSettings({...renderSettings, viewType: value})}
                  data={viewTypeOptions.map(v => ({ value: v.value, label: v.label }))}
                  mb="md"
                />

                <Group grow mb="md">
                  <Switch
                    label="Materialen"
                    checked={renderSettings.includeMaterials}
                    onChange={(e) => setRenderSettings({...renderSettings, includeMaterials: e.currentTarget.checked})}
                  />
                  <Switch
                    label="Meubilair"
                    checked={renderSettings.includeFurniture}
                    onChange={(e) => setRenderSettings({...renderSettings, includeFurniture: e.currentTarget.checked})}
                  />
                </Group>

                <Button
                  fullWidth
                  size="lg"
                  leftIcon={<IconBrandBlender size={20} />}
                  onClick={handleGenerateRender}
                  loading={loading && activeRenderJob}
                  disabled={!extractedMaterials || loading}
                  color="blue"
                >
                  3D Render Genereren
                </Button>

                <Text size="xs" color="dimmed" mt="sm" align="center">
                  Render tijd: {renderSettings.quality === 'low' ? '1-2 min' : 
                               renderSettings.quality === 'medium' ? '3-5 min' : 
                               renderSettings.quality === 'high' ? '5-10 min' : '10-20 min'}
                </Text>
              </Card>
            </Grid.Col>

            {/* Right Column - Preview & Results */}
            <Grid.Col span={8}>
              <Card withBorder shadow="sm" style={{ height: '100%' }}>
                <Card.Section withBorder p="md">
                  <Group position="apart">
                    <Title order={4}><IconPhoto size={20} /> Render Preview & Resultaten</Title>
                    <Badge color={renders.length > 0 ? "green" : "gray"}>
                      {renders.length} renders
                    </Badge>
                  </Group>
                </Card.Section>

                {renders.length > 0 ? (
                  <SimpleGrid cols={2} spacing="md">
                    {renders.map((render) => (
                      <Card key={render.id} withBorder>
                        <Card.Section>
                          {render.render_url ? (
                            <Image
                              src={render.render_url}
                              alt={`Render ${render.render_type}`}
                              height={200}
                              fit="cover"
                            />
                          ) : (
                            <Center style={{ height: 200, background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                              backgroundSize: '20px 20px',
                              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                              <Stack align="center">
                                <IconProgress size={48} color="#adb5bd" />
                                <Text color="dimmed">Bezig met renderen...</Text>
                              </Stack>
                            </Center>
                          )}
                        </Card.Section>
                        
                        <Group position="apart" mt="md">
                          <div>
                            <Text weight={500} size="sm">
                              {render.render_type === 'interior' ? 'Interieur' :
                               render.render_type === 'exterior' ? 'Exterieur' :
                               render.render_type === 'topdown' ? 'Vogelvlucht' : 'Doorsnede'}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {new Date(render.created_at).toLocaleDateString()}
                            </Text>
                          </div>
                          
                          <Group spacing="xs">
                            {render.render_url && (
                              <Tooltip label="Download">
                                <ActionIcon
                                  color="blue"
                                  onClick={() => handleDownloadRender(render.render_url, render.render_type)}
                                >
                                  <IconDownload size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Verwijder">
                              <ActionIcon
                                color="red"
                                onClick={() => handleDeleteRender(render.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                        
                        <Group spacing="xs" mt="xs">
                          <Badge size="xs" variant="light" color={
                            render.status === 'completed' ? 'green' :
                            render.status === 'processing' ? 'blue' :
                            render.status === 'failed' ? 'red' : 'gray'
                          }>
                            {render.status}
                          </Badge>
                          <Badge size="xs" variant="dot">
                            {render.quality}
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Center style={{ height: 400 }}>
                    <Stack align="center" spacing="md">
                      <IconCubeSend size={64} color="#adb5bd" />
                      <Text size="lg" color="dimmed">Nog geen renders beschikbaar</Text>
                      <Text size="sm" color="dimmed" align="center">
                        Selecteer een calculatie en genereer je eerste 3D render
                      </Text>
                    </Stack>
                  </Center>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Materials Tab */}
        <Tabs.Panel value="materials" pt="md">
          {materialAnalysis ? (
            <Grid>
              <Grid.Col span={8}>
                <Card withBorder>
                  <Card.Section withBorder p="md">
                    <Title order={4}><IconMaterials size={20} /> Materialen Overzicht</Title>
                  </Card.Section>
                  
                  <SimpleGrid cols={3} spacing="md" mt="md">
                    {extractedMaterials.map((material, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Group position="apart" mb="xs">
                          <Text weight={500}>{material.name}</Text>
                          <Badge size="sm">{material.category}</Badge>
                        </Group>
                        <Text size="sm" color="dimmed" mb="xs">
                          Type: {material.type}
                        </Text>
                        <Group spacing="xs">
                          <Badge size="xs" variant="dot" color="blue">
                            {material.unit}
                          </Badge>
                          {material.average_price && (
                            <Badge size="xs" variant="light" color="green">
                              €{material.average_price}/{material.unit}
                            </Badge>
                          )}
                        </Group>
                        <Group mt="md" spacing="xs">
                          <Box
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              background: `rgb(${material.color?.map(c => Math.floor(c * 255)).join(',') || '128,128,128'})`,
                              border: '1px solid #dee2e6'
                            }}
                          />
                          <Text size="xs">Ruwheid: {material.roughness}</Text>
                          <Text size="xs">Metaal: {material.metallic}</Text>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={4}>
                <Card withBorder>
                  <Card.Section withBorder p="md">
                    <Title order={4}><IconRuler size={20} /> Analyse</Title>
                  </Card.Section>
                  
                  <Stack spacing="md" mt="md">
                    <Paper p="md" withBorder>
                      <Text weight={500} mb="xs">Kosten Overzicht</Text>
                      <Progress 
                        value={materialAnalysis.total_cost > 0 ? 100 : 0}
                        size="lg"
                        color="blue"
                        mb="xs"
                      />
                      <Group position="apart">
                        <Text size="sm">Totaal waarde:</Text>
                        <Text weight={500}>€{materialAnalysis.total_cost?.toFixed(2) || '0.00'}</Text>
                      </Group>
                    </Paper>
                    
                    <Paper p="md" withBorder>
                      <Text weight={500} mb="md">Materiaal Verdeling</Text>
                      {materialAnalysis.material_distribution?.map((dist, index) => (
                        <div key={index} mb="xs">
                          <Group position="apart" mb={4}>
                            <Text size="sm">{dist.category}</Text>
                            <Text size="sm" weight={500}>{dist.percentage.toFixed(1)}%</Text>
                          </Group>
                          <Progress value={dist.percentage} size="sm" />
                        </div>
                      ))}
                    </Paper>
                    
                    <Paper p="md" withBorder>
                      <Text weight={500} mb="xs">Statistieken</Text>
                      <List spacing="xs">
                        <List.Item>
                          <Group position="apart">
                            <Text size="sm">Unieke materialen:</Text>
                            <Text size="sm" weight={500}>{materialAnalysis.materials.length}</Text>
                          </Group>
                        </List.Item>
                        <List.Item>
                          <Group position="apart">
                            <Text size="sm">Categorieën:</Text>
                            <Text size="sm" weight={500}>{materialAnalysis.categories.length}</Text>
                          </Group>
                        </List.Item>
                        <List.Item>
                          <Group position="apart">
                            <Text size="sm">Oppervlakte:</Text>
                            <Text size="sm" weight={500}>{materialAnalysis.total_area?.toFixed(1)} m²</Text>
                          </Group>
                        </List.Item>
                      </List>
                    </Paper>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          ) : (
            <Card withBorder>
              <Center style={{ height: 300 }}>
                <Stack align="center" spacing="md">
                  <IconBox size={64} color="#adb5bd" />
                  <Text size="lg" color="dimmed">Nog geen materialen geëxtraheerd</Text>
                  <Text size="sm" color="dimmed" align="center">
                    Selecteer een calculatie en klik op "Materialen Extraheren"
                  </Text>
                  <Button
                    leftIcon={<IconBox size={18} />}
                    onClick={handleExtractMaterials}
                    disabled={!selectedCalculatie}
                  >
                    Materialen Extraheren
                  </Button>
                </Stack>
              </Center>
            </Card>
          )}
        </Tabs.Panel>

        {/* Render Library Tab */}
        <Tabs.Panel value="library" pt="md">
          <Card withBorder>
            <Card.Section withBorder p="md">
              <Group position="apart">
                <Title order={4}><IconLayoutGrid size={20} /> Render Bibliotheek</Title>
                <Badge color="blue" variant="light">
                  {renders.filter(r => r.status === 'completed').length} voltooid
                </Badge>
              </Group>
            </Card.Section>
            
            {renders.filter(r => r.status === 'completed').length > 0 ? (
              <SimpleGrid cols={3} spacing="md" mt="md">
                {renders
                  .filter(r => r.status === 'completed')
                  .map((render) => (
                    <Card key={render.id} withBorder>
                      <Card.Section>
                        <Image
                          src={render.render_url}
                          alt={`Render ${render.render_type}`}
                          height={180}
                          fit="cover"
                        />
                      </Card.Section>
                      
                      <Group position="apart" mt="md">
                        <div>
                          <Text weight={500} size="sm">
                            {render.render_type === 'interior' ? 'Interieur Render' :
                             render.render_type === 'exterior' ? 'Exterieur Render' :
                             render.render_type === 'topdown' ? 'Vogelvlucht' : 'Doorsnede'}
                          </Text>
                          <Text size="xs" color="dimmed">
                            {new Date(render.created_at).toLocaleDateString('nl-NL')}
                          </Text>
                        </div>
                        <ActionIcon
                          color="blue"
                          onClick={() => handleDownloadRender(render.render_url)}
                        >
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
              </SimpleGrid>
            ) : (
              <Center style={{ height: 300 }}>
                <Stack align="center" spacing="md">
                  <IconPhoto size={64} color="#adb5bd" />
                  <Text size="lg" color="dimmed">Nog geen renders in bibliotheek</Text>
                  <Text size="sm" color="dimmed" align="center">
                    Genereer eerst een 3D render om je bibliotheek te vullen
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="md">
          <Card withBorder>
            <Card.Section withBorder p="md">
              <Title order={4}><IconSettings size={20} /> BIM Instellingen</Title>
            </Card.Section>
            
            <SimpleGrid cols={2} spacing="md" mt="md">
              <Paper p="md" withBorder>
                <Text weight={500} mb="md">Render Defaults</Text>
                <Stack spacing="md">
                  <Select
                    label="Standaard kwaliteit"
                    defaultValue="medium"
                    data={qualityOptions}
                  />
                  <Select
                    label="Standaard type"
                    defaultValue="interior"
                    data={renderTypes}
                  />
                  <Switch label="Automatisch materialen extraheren" />
                  <Switch label="Watermerk toevoegen" />
                </Stack>
              </Paper>
              
              <Paper p="md" withBorder>
                <Text weight={500} mb="md">Opslag & Export</Text>
                <Stack spacing="md">
                  <Select
                    label="Standaard export formaat"
                    defaultValue="png"
                    data={[
                      { value: 'png', label: 'PNG (aanbevolen)' },
                      { value: 'jpg', label: 'JPG (kleiner)' },
                      { value: 'webp', label: 'WebP (modern)' }
                    ]}
                  />
                  <NumberInput
                    label="Max render grootte (MB)"
                    defaultValue={50}
                    min={10}
                    max={500}
                  />
                  <Switch label="Automatisch backup naar cloud" />
                  <Button leftIcon={<IconCloudUpload size={18} />} variant="light">
                    Opslagbeheer
                  </Button>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Render Progress Modal */}
      <Modal
        opened={renderModalOpen}
        onClose={() => {}}
        title="3D Render Generatie"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        centered
      >
        <Stack align="center" spacing="md">
          <IconBrandBlender size={64} color="#4dabf7" />
          <Title order={3}>Render wordt gegenereerd</Title>
          <Text color="dimmed" align="center">
            Dit kan enkele minuten duren, afhankelijk van de geselecteerde kwaliteit.
          </Text>
          
          <Progress
            value={renderProgress}
            size="xl"
            radius="xl"
            style={{ width: '100%' }}
            label={`${renderProgress}%`}
            animate
          />
          
          <Text size="sm" color="dimmed">
            Status: {renderProgress < 50 ? 'Voorbereiden' : 
                    renderProgress < 100 ? 'Rendering' : 'Voltooid'}
          </Text>
          
          {activeRenderJob?.estimated_completion && (
            <Text size="xs" color="dimmed">
              Geschatte eindtijd: {new Date(activeRenderJob.estimated_completion).toLocaleTimeString()}
            </Text>
          )}
          
          <Button
            variant="light"
            color="red"
            onClick={() => {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
              }
              setRenderModalOpen(false)
              setLoading(false)
              setActiveRenderJob(null)
              notifications.show({
                title: 'Render geannuleerd',
                message: 'Render proces gestopt',
                color: 'yellow'
              })
            }}
            disabled={renderProgress >= 100}
          >
            Annuleren
          </Button>
        </Stack>
      </Modal>
    </Container>
  )
}
