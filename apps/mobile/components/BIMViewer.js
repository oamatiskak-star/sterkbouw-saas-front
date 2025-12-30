import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder, Alert } from 'react-native';
import { Canvas, useLoader, useFrame } from '@react-three/fiber/native';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TextureLoader } from 'expo-three';
import { OrbitControls } from '@react-three/drei/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const BIMViewer = ({ modelUrl, materials }) => {
const [model, setModel] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [viewMode, setViewMode] = useState('3d'); // '3d', 'top', 'front', 'side'
const [selectedElement, setSelectedElement] = useState(null);
const [showInfo, setShowInfo] = useState(false);

// Mock BIM data structure
const mockBIMData = {
elements: [
{ id: 'wall_001', type: 'wall', name: 'Exterior Wall North', material: 'Concrete', status: 'completed' },
{ id: 'wall_002', type: 'wall', name: 'Exterior Wall South', material: 'Concrete', status: 'in_progress' },
{ id: 'slab_001', type: 'slab', name: 'Ground Floor Slab', material: 'Reinforced Concrete', status: 'completed' },
{ id: 'beam_001', type: 'beam', name: 'Main Support Beam A', material: 'Steel', status: 'planned' },
{ id: 'column_001', type: 'column', name: 'Column C1', material: 'Concrete', status: 'completed' },
{ id: 'window_001', type: 'window', name: 'Main Entrance Window', material: 'Glass', status: 'planned' },
],
floors: ['Ground Floor', 'First Floor', 'Second Floor'],
materials: ['Concrete', 'Steel', 'Glass', 'Wood', 'Brick'],
};

useEffect(() => {
// In a real app, this would load actual BIM models
// For demo, we'll use a mock loading process
const timer = setTimeout(() => {
setLoading(false);
// Simulate model load
setModel({ name: 'Project Model', version: '1.0' });
}, 1500);

text
return () => clearTimeout(timer);
}, []);

const handleElementSelect = (element) => {
setSelectedElement(element);
setShowInfo(true);

text
Alert.alert(
  element.name,
  `Type: ${element.type}\nMaterial: ${element.material}\nStatus: ${element.status}`,
  [
    { text: "Close", style: "cancel" },
    { text: "View Details", onPress: () => {
      // Navigate to element details
    }}
  ]
);
};

const renderElementStatus = (status) => {
const statusColors = {
completed: '#4CAF50',
in_progress: '#FF9800',
planned: '#2196F3',
delayed: '#F44336'
};

text
const statusIcons = {
  completed: 'check-circle',
  in_progress: 'progress-clock',
  planned: 'calendar-clock',
  delayed: 'alert-circle'
};

return (
  <View style={[styles.statusBadge, { backgroundColor: statusColors[status] + '20' }]}>
    <Icon name={statusIcons[status]} size={12} color={statusColors[status]} />
    <Text style={[styles.statusText, { color: statusColors[status] }]}>
      {status.replace('_', ' ')}
    </Text>
  </View>
);
};

const render3DView = () => (
<View style={styles.view3DContainer}>
{/* This would be replaced with actual Three.js canvas */}
<View style={styles.canvasPlaceholder}>
<Icon name="cube-scan" size={80} color="#ccc" />
<Text style={styles.placeholderText}>3D Model Viewer</Text>
<Text style={styles.placeholderSubtext}>Interactive BIM visualization</Text>

text
    <View style={styles.mockModel}>
      <View style={styles.mockBuilding}>
        <View style={styles.mockFloor} />
        <View style={styles.mockFloor} />
        <View style={styles.mockFloor} />
        <View style={styles.mockRoof} />
      </View>
    </View>
  </View>
  
  <View style={styles.viewControls}>
    <TouchableOpacity 
      style={[styles.viewControlButton, viewMode === '3d' && styles.viewControlActive]}
      onPress={() => setViewMode('3d')}
    >
      <Icon name="cube" size={20} color={viewMode === '3d' ? '#2196F3' : '#666'} />
      <Text style={[styles.viewControlText, viewMode === '3d' && styles.viewControlTextActive]}>3D</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.viewControlButton, viewMode === 'top' && styles.viewControlActive]}
      onPress={() => setViewMode('top')}
    >
      <Icon name="view-dashboard" size={20} color={viewMode === 'top' ? '#2196F3' : '#666'} />
      <Text style={[styles.viewControlText, viewMode === 'top' && styles.viewControlTextActive]}>Top</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.viewControlButton, viewMode === 'front' && styles.viewControlActive]}
      onPress={() => setViewMode('front')}
    >
      <Icon name="view-day" size={20} color={viewMode === 'front' ? '#2196F3' : '#666'} />
      <Text style={[styles.viewControlText, viewMode === 'front' && styles.viewControlTextActive]}>Front</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.viewControlButton, viewMode === 'side' && styles.viewControlActive]}
      onPress={() => setViewMode('side')}
    >
      <Icon name="view-sequential" size={20} color={viewMode === 'side' ? '#2196F3' : '#666'} />
      <Text style={[styles.viewControlText, viewMode === 'side' && styles.viewControlTextActive]}>Side</Text>
    </TouchableOpacity>
  </View>
</View>
);

const renderElementList = () => (
<View style={styles.elementList}>
<Text style={styles.elementListTitle}>Building Elements</Text>
{mockBIMData.elements.map(element => (
<TouchableOpacity
key={element.id}
style={styles.elementCard}
onPress={() => handleElementSelect(element)}
>
<View style={styles.elementHeader}>
<Icon
name={element.type === 'wall' ? 'wall' :
element.type === 'slab' ? 'floor-plan' :
element.type === 'beam' ? 'view-parallel' :
element.type === 'column' ? 'pillar' : 'window'}
size={20}
color="#2196F3"
/>
<View style={styles.elementInfo}>
<Text style={styles.elementName}>{element.name}</Text>
<Text style={styles.elementType}>{element.type} • {element.material}</Text>
</View>
</View>
{renderElementStatus(element.status)}
</TouchableOpacity>
))}
</View>
);

const renderFloorSelector = () => (
<View style={styles.floorSelector}>
<Text style={styles.floorTitle}>Floors</Text>
<View style={styles.floorButtons}>
{mockBIMData.floors.map((floor, index) => (
<TouchableOpacity key={index} style={styles.floorButton}>
<Text style={styles.floorButtonText}>{floor}</Text>
</TouchableOpacity>
))}
</View>
</View>
);

const renderMaterialLegend = () => (
<View style={styles.materialLegend}>
<Text style={styles.legendTitle}>Materials</Text>
<View style={styles.legendItems}>
{mockBIMData.materials.map((material, index) => (
<View key={index} style={styles.legendItem}>
<View style={[styles.legendColor, { backgroundColor: getMaterialColor(material) }]} />
<Text style={styles.legendText}>{material}</Text>
</View>
))}
</View>
</View>
);

const getMaterialColor = (material) => {
const colors = {
'Concrete': '#9E9E9E',
'Steel': '#607D8B',
'Glass': '#80DEEA',
'Wood': '#8D6E63',
'Brick': '#D84315'
};
return colors[material] || '#ccc';
};

if (loading) {
return (
<View style={styles.loadingContainer}>
<View style={styles.spinner}>
<Icon name="cube-outline" size={40} color="#2196F3" />
</View>
<Text style={styles.loadingText}>Loading BIM Model...</Text>
</View>
);
}

if (error) {
return (
<View style={styles.errorContainer}>
<Icon name="alert-circle-outline" size={60} color="#F44336" />
<Text style={styles.errorText}>Failed to load model</Text>
<Text style={styles.errorSubtext}>{error}</Text>
<TouchableOpacity style={styles.retryButton}>
<Text style={styles.retryButtonText}>Retry</Text>
</TouchableOpacity>
</View>
);
}

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>BIM Viewer</Text>
<View style={styles.headerActions}>
<TouchableOpacity style={styles.headerButton}>
<Icon name="layers" size={20} color="#666" />
</TouchableOpacity>
<TouchableOpacity style={styles.headerButton}>
<Icon name="ruler-square" size={20} color="#666" />
</TouchableOpacity>
<TouchableOpacity style={styles.headerButton}>
<Icon name="information" size={20} color="#666" />
</TouchableOpacity>
</View>
</View>

text
  {render3DView()}
  
  <View style={styles.content}>
    {renderFloorSelector()}
    {renderElementList()}
    {renderMaterialLegend()}
  </View>
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f5f5f5' },
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#f5f5f5'
},
spinner: {
width: 80,
height: 80,
borderRadius: 40,
backgroundColor: '#fff',
justifyContent: 'center',
alignItems: 'center',
elevation: 2,
marginBottom: 20
},
loadingText: { fontSize: 16, color: '#666', marginTop: 10 },
errorContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#f5f5f5',
padding: 20
},
errorText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 10 },
errorSubtext: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
retryButton: {
marginTop: 20,
backgroundColor: '#2196F3',
paddingHorizontal: 30,
paddingVertical: 10,
borderRadius: 5
},
retryButtonText: { color: '#fff', fontWeight: '500' },
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
padding: 15,
backgroundColor: '#fff',
elevation: 2
},
headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
headerActions: { flexDirection: 'row' },
headerButton: {
width: 36,
height: 36,
borderRadius: 18,
backgroundColor: '#f0f0f0',
justifyContent: 'center',
alignItems: 'center',
marginLeft: 10
},
view3DContainer: {
height: height * 0.4,
backgroundColor: '#000'
},
canvasPlaceholder: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#1a1a1a'
},
placeholderText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 10 },
placeholderSubtext: { color: '#aaa', fontSize: 12, marginTop: 5 },
mockModel: {
position: 'absolute',
bottom: 40,
alignItems: 'center'
},
mockBuilding: {
alignItems: 'center'
},
mockFloor: {
width: 120,
height: 20,
backgroundColor: '#fff',
marginBottom: 2,
borderRadius: 2
},
mockRoof: {
width: 100,
height: 10,
backgroundColor: '#ccc',
borderTopLeftRadius: 5,
borderTopRightRadius: 5
},
viewControls: {
position: 'absolute',
bottom: 10,
left: 10,
right: 10,
flexDirection: 'row',
justifyContent: 'space-around',
backgroundColor: 'rgba(255,255,255,0.9)',
borderRadius: 25,
paddingVertical: 8
},
viewControlButton: {
alignItems: 'center',
paddingHorizontal: 10
},
viewControlActive: { },
viewControlText: {
fontSize: 12,
color: '#666',
marginTop: 2
},
viewControlTextActive: {
color: '#2196F3',
fontWeight: '500'
},
content: {
flex: 1,
padding: 10
},
floorSelector: {
backgroundColor: '#fff',
borderRadius: 8,
padding: 15,
marginBottom: 10,
elevation: 1
},
floorTitle: {
fontSize: 16,
fontWeight: '600',
color: '#333',
marginBottom: 10
},
floorButtons: {
flexDirection: 'row',
flexWrap: 'wrap'
},
floorButton: {
backgroundColor: '#f0f0f0',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 15,
marginRight: 10,
marginBottom: 10
},
floorButtonText: {
fontSize: 14,
color: '#333'
},
elementList: {
backgroundColor: '#fff',
borderRadius: 8,
padding: 15,
marginBottom: 10,
elevation: 1
},
elementListTitle: {
fontSize: 16,
fontWeight: '600',
color: '#333',
marginBottom: 10
},
elementCard: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingVertical: 12,
borderBottomWidth: 1,
borderBottomColor: '#f0f0f0'
},
elementHeader: {
flexDirection: 'row',
alignItems: 'center',
flex: 1
},
elementInfo: {
marginLeft: 10
},
elementName: {
fontSize: 14,
fontWeight: '500',
color: '#333'
},
elementType: {
fontSize: 12,
color: '#666',
marginTop: 2
},
statusBadge: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 10
},
statusText: {
fontSize: 10,
fontWeight: '500',
marginLeft: 4
},
materialLegend: {
backgroundColor: '#fff',
borderRadius: 8,
padding: 15,
elevation: 1
},
legendTitle: {
fontSize: 16,
fontWeight: '600',
color: '#333',
marginBottom: 10
},
legendItems: {
flexDirection: 'row',
flexWrap: 'wrap'
},
legendItem: {
flexDirection: 'row',
alignItems: 'center',
marginRight: 15,
marginBottom: 10
},
legendColor: {
width: 12,
height: 12,
borderRadius: 6,
marginRight: 6
},
legendText: {
fontSize: 12,
color: '#666'
}
});

export default BIMViewer;
