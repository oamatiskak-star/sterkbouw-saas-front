import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polygon, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useDatabase } from '../hooks/useDatabase';

const { width, height } = Dimensions.get('window');

const SiteMap = ({ projectId }) => {
const [location, setLocation] = useState(null);
const [errorMsg, setErrorMsg] = useState(null);
const [siteZones, setSiteZones] = useState([]);
const [machinery, setMachinery] = useState([]);
const [selectedZone, setSelectedZone] = useState(null);
const [mapType, setMapType] = useState('standard');
const mapRef = useRef(null);

const { executeQuery } = useDatabase();

// Default coordinates (centered on a construction site in Netherlands)
const DEFAULT_REGION = {
latitude: 52.3676,
longitude: 4.9041,
latitudeDelta: 0.002,
longitudeDelta: 0.002,
};

useEffect(() => {
(async () => {
let { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
setErrorMsg('Permission to access location was denied');
setLocation(DEFAULT_REGION);
return;
}

text
  let location = await Location.getCurrentPositionAsync({});
  setLocation({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
})();

loadSiteData();
}, [projectId]);

const loadSiteData = async () => {
// Load site zones
const zones = await executeQuery(
"SELECT * FROM site_zones WHERE project_id = ? ORDER BY zone_order",
[projectId]
);

text
// If no zones in DB, create mock zones
if (zones.length === 0) {
  const mockZones = [
    {
      id: 1,
      name: 'Material Storage',
      type: 'storage',
      color: '#FF9800',
      coordinates: [
        { latitude: 52.3670, longitude: 4.9035 },
        { latitude: 52.3672, longitude: 4.9035 },
        { latitude: 52.3672, longitude: 4.9038 },
        { latitude: 52.3670, longitude: 4.9038 },
      ],
      description: 'Primary material storage area'
    },
    {
      id: 2,
      name: 'Work Area A',
      type: 'work',
      color: '#4CAF50',
      coordinates: [
        { latitude: 52.3673, longitude: 4.9035 },
        { latitude: 52.3675, longitude: 4.9035 },
        { latitude: 52.3675, longitude: 4.9038 },
        { latitude: 52.3673, longitude: 4.9038 },
      ],
      description: 'Main construction work area'
    },
    {
      id: 3,
      name: 'Equipment Zone',
      type: 'equipment',
      color: '#2196F3',
      coordinates: [
        { latitude: 52.3670, longitude: 4.9040 },
        { latitude: 52.3672, longitude: 4.9040 },
        { latitude: 52.3672, longitude: 4.9043 },
        { latitude: 52.3670, longitude: 4.9043 },
      ],
      description: 'Heavy equipment parking'
    },
    {
      id: 4,
      name: 'Safety Zone',
      type: 'safety',
      color: '#F44336',
      coordinates: [
        { latitude: 52.3673, longitude: 4.9040 },
        { latitude: 52.3674, longitude: 4.9040 },
        { latitude: 52.3674, longitude: 4.9043 },
        { latitude: 52.3673, longitude: 4.9043 },
      ],
      description: 'Restricted safety area'
    },
  ];
  setSiteZones(mockZones);
} else {
  setSiteZones(zones);
}

// Load machinery locations
const mockMachinery = [
  {
    id: 1,
    name: 'Crane A',
    type: 'crane',
    latitude: 52.3671,
    longitude: 4.9036,
    status: 'active'
  },
  {
    id: 2,
    name: 'Excavator #1',
    type: 'excavator',
    latitude: 52.3674,
    longitude: 4.9036,
    status: 'active'
  },
  {
    id: 3,
    name: 'Cement Mixer',
    type: 'mixer',
    latitude: 52.3671,
    longitude: 4.9041,
    status: 'idle'
  },
  {
    id: 4,
    name: 'Dump Truck',
    type: 'truck',
    latitude: 52.3674,
    longitude: 4.9041,
    status: 'maintenance'
  },
];
setMachinery(mockMachinery);
};

const getZoneIcon = (type) => {
const icons = {
'storage': 'package-variant',
'work': 'hammer',
'equipment': 'tools',
'safety': 'shield-alert',
'office': 'office-building',
'parking': 'parking',
'entrance': 'gate',
'storage': 'warehouse'
};
return icons[type] || 'map-marker';
};

const getMachineryIcon = (type, status) => {
const icons = {
'crane': 'crane',
'excavator': 'excavator',
'mixer': 'mixer',
'truck': 'truck',
'loader': 'tractor',
'generator': 'flash'
};

text
const statusColor = {
  'active': '#4CAF50',
  'idle': '#FF9800',
  'maintenance': '#F44336',
  'off': '#9E9E9E'
};

return { name: icons[type] || 'toolbox', color: statusColor[status] || '#666' };
};

const handleZonePress = (zone) => {
setSelectedZone(zone);

text
Alert.alert(
  zone.name,
  `${zone.description}\n\nType: ${zone.type}`,
  [
    { text: "Close", style: "cancel" },
    { text: "View Details", onPress: () => {
      // Navigate to zone details
    }}
  ]
);
};

const handleMachineryPress = (machine) => {
Alert.alert(
machine.name,
Status: ${machine.status}\nLast updated: 2 hours ago,
[
{ text: "Close", style: "cancel" },
{ text: "Service History", onPress: () => {
// Navigate to machinery details
}}
]
);
};

const zoomToLocation = () => {
if (mapRef.current && location) {
mapRef.current.animateToRegion(location, 1000);
}
};

const zoomToSite = () => {
if (mapRef.current && siteZones.length > 0) {
// Calculate bounds of all zones
const coordinates = siteZones.flatMap(zone => zone.coordinates);
const latitudes = coordinates.map(c => c.latitude);
const longitudes = coordinates.map(c => c.longitude);

text
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) * 1.1,
    longitudeDelta: (maxLng - minLng) * 1.1,
  };
  
  mapRef.current.animateToRegion(region, 1000);
}
};

const renderZonePolygons = () => {
return siteZones.map(zone => (
<Polygon
key={zone.id}
coordinates={zone.coordinates}
fillColor={zone.color + '40'}
strokeColor={zone.color}
strokeWidth={2}
tappable
onPress={() => handleZonePress(zone)}
/>
));
};

const renderZoneMarkers = () => {
return siteZones.map(zone => {
// Calculate center of polygon for marker
const centerLat = zone.coordinates.reduce((sum, coord) => sum + coord.latitude, 0) / zone.coordinates.length;
const centerLng = zone.coordinates.reduce((sum, coord) => sum + coord.longitude, 0) / zone.coordinates.length;

text
  return (
    <Marker
      key={`marker-${zone.id}`}
      coordinate={{ latitude: centerLat, longitude: centerLng }}
      onPress={() => handleZonePress(zone)}
    >
      <View style={[styles.zoneMarker, { backgroundColor: zone.color }]}>
        <Icon name={getZoneIcon(zone.type)} size={16} color="#fff" />
      </View>
    </Marker>
  );
});
};

const renderMachineryMarkers = () => {
return machinery.map(machine => {
const icon = getMachineryIcon(machine.type, machine.status);

text
  return (
    <Marker
      key={`machine-${machine.id}`}
      coordinate={{ latitude: machine.latitude, longitude: machine.longitude }}
      onPress={() => handleMachineryPress(machine)}
    >
      <View style={styles.machineryMarker}>
        <Icon name={icon.name} size={24} color={icon.color} />
        <View style={[styles.machineStatus, { backgroundColor: icon.color }]} />
      </View>
    </Marker>
  );
});
};

const renderLegend = () => (
<View style={styles.legend}>
<Text style={styles.legendTitle}>Site Zones</Text>
{siteZones.map(zone => (
<View key={zone.id} style={styles.legendItem}>
<View style={[styles.legendColor, { backgroundColor: zone.color }]} />
<Text style={styles.legendText}>{zone.name}</Text>
</View>
))}
</View>
);

const renderMapControls = () => (
<View style={styles.mapControls}>
<TouchableOpacity style={styles.controlButton} onPress={zoomToLocation}>
<Icon name="crosshairs-gps" size={20} color="#666" />
</TouchableOpacity>

text
  <TouchableOpacity style={styles.controlButton} onPress={zoomToSite}>
    <Icon name="map-search" size={20} color="#666" />
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.controlButton} 
    onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
  >
    <Icon name={mapType === 'standard' ? 'satellite' : 'map'} size={20} color="#666" />
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.controlButton}>
    <Icon name="layers" size={20} color="#666" />
  </TouchableOpacity>
</View>
);

return (
<View style={styles.container}>
{errorMsg ? (
<View style={styles.errorContainer}>
<Text style={styles.errorText}>{errorMsg}</Text>
</View>
) : null}

text
  <MapView
    ref={mapRef}
    style={styles.map}
    provider={PROVIDER_GOOGLE}
    initialRegion={location || DEFAULT_REGION}
    mapType={mapType}
    showsUserLocation={true}
    showsMyLocationButton={false}
    showsCompass={true}
    showsScale={true}
  >
    {renderZonePolygons()}
    {renderZoneMarkers()}
    {renderMachineryMarkers()}
    
    {location && (
      <Marker coordinate={location} title="Your Location" pinColor="#2196F3">
        <View style={styles.userLocation}>
          <Icon name="account" size={16} color="#fff" />
        </View>
      </Marker>
    )}
  </MapView>

  {renderMapControls()}
  {renderLegend()}
  
  <View style={styles.bottomPanel}>
    <Text style={styles.panelTitle}>Construction Site Map</Text>
    <Text style={styles.panelSubtitle}>{siteZones.length} zones • {machinery.length} equipment</Text>
    
    {selectedZone && (
      <View style={styles.selectedZoneInfo}>
        <View style={[styles.zoneColor, { backgroundColor: selectedZone.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedZoneName}>{selectedZone.name}</Text>
          <Text style={styles.selectedZoneDesc}>{selectedZone.description}</Text>
        </View>
        <TouchableOpacity onPress={() => setSelectedZone(null)}>
          <Icon name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    )}
  </View>
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1 },
errorContainer: {
padding: 10,
backgroundColor: '#FFEBEE',
alignItems: 'center'
},
errorText: { color: '#F44336' },
map: { width, height },
mapControls: {
position: 'absolute',
top: 20,
right: 10,
backgroundColor: '#fff',
borderRadius: 8,
elevation: 4,
padding: 5
},
controlButton: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: '#fff',
justifyContent: 'center',
alignItems: 'center',
marginVertical: 2,
elevation: 2
},
zoneMarker: {
width: 32,
height: 32,
borderRadius: 16,
justifyContent: 'center',
alignItems: 'center',
borderWidth: 2,
borderColor: '#fff',
elevation: 2
},
machineryMarker: {
alignItems: 'center'
},
machineStatus: {
width: 8,
height: 8,
borderRadius: 4,
position: 'absolute',
bottom: -2
},
userLocation: {
width: 24,
height: 24,
borderRadius: 12,
backgroundColor: '#2196F3',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 2,
borderColor: '#fff',
elevation: 2
},
legend: {
position: 'absolute',
top: 20,
left: 10,
backgroundColor: '#fff',
borderRadius: 8,
padding: 10,
elevation: 4,
minWidth: 150
},
legendTitle: {
fontSize: 12,
fontWeight: '600',
color: '#333',
marginBottom: 8
},
legendItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 6
},
legendColor: {
width: 12,
height: 12,
borderRadius: 2,
marginRight: 8
},
legendText: {
fontSize: 11,
color: '#666'
},
bottomPanel: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
backgroundColor: '#fff',
borderTopLeftRadius: 15,
borderTopRightRadius: 15,
padding: 15,
elevation: 8
},
panelTitle: {
fontSize: 18,
fontWeight: 'bold',
color: '#333'
},
panelSubtitle: {
fontSize: 12,
color: '#666',
marginBottom: 10
},
selectedZoneInfo: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#f5f5f5',
padding: 10,
borderRadius: 8,
marginTop: 5
},
zoneColor: {
width: 16,
height: 16,
borderRadius: 4,
marginRight: 10
},
selectedZoneName: {
fontSize: 14,
fontWeight: '600',
color: '#333'
},
selectedZoneDesc: {
fontSize: 12,
color: '#666'
}
});

export default SiteMap;
