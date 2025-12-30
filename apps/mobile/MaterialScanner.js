import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '../hooks/useDatabase';
import MaterialDetails from './MaterialDetails';

const { width, height } = Dimensions.get('window');

const MaterialScanner = ({ projectId, onMaterialScanned }) => {
const [hasPermission, setHasPermission] = useState(null);
const [scanned, setScanned] = useState(false);
const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
const [scannedMaterial, setScannedMaterial] = useState(null);
const cameraRef = useRef(null);
const { executeQuery } = useDatabase();

useEffect(() => {
(async () => {
const { status } = await Camera.requestCameraPermissionsAsync();
setHasPermission(status === 'granted');
})();
}, []);

const handleBarCodeScanned = async ({ type, data }) => {
setScanned(true);

text
try {
  // Parse the scanned data (could be QR or barcode)
  let materialData = null;
  
  // Check if it's JSON format
  if (data.startsWith('{')) {
    materialData = JSON.parse(data);
  } else {
    // Try to find material by code in database
    const result = await executeQuery(
      `SELECT m.*, s.name AS supplier_name 
       FROM materials m 
       LEFT JOIN suppliers s ON m.supplier_id = s.id 
       WHERE m.code = ? OR m.serial_number = ?`,
      [data, data]
    );
    
    if (result.length > 0) {
      materialData = result[0];
    } else {
      // Create new material from barcode
      materialData = {
        id: Date.now(),
        code: data,
        name: `Scanned Material ${data.substring(0, 8)}`,
        description: 'Automatically scanned material',
        quantity: 1,
        unit: 'pcs',
        status: 'on_site',
        scanned_date: new Date().toISOString()
      };
    }
  }
  
  setScannedMaterial(materialData);
  
  if (onMaterialScanned) {
    onMaterialScanned(materialData);
  }
  
  // Alert with scanned info
  Alert.alert(
    "Material Scanned",
    `Code: ${materialData.code}\nName: ${materialData.name}`,
    [
      { text: "Scan Another", onPress: () => setScanned(false) },
      { text: "View Details", onPress: () => {} }
    ]
  );
} catch (error) {
  console.error('Error processing scan:', error);
  Alert.alert("Scan Error", "Could not process the scanned code");
  setTimeout(() => setScanned(false), 2000);
}
};

const toggleCameraType = () => {
setCameraType(
cameraType === Camera.Constants.Type.back
? Camera.Constants.Type.front
: Camera.Constants.Type.back
);
};

const toggleFlash = () => {
setFlashMode(
flashMode === Camera.Constants.FlashMode.off
? Camera.Constants.FlashMode.torch
: Camera.Constants.FlashMode.off
);
};

if (hasPermission === null) {
return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
}

if (hasPermission === false) {
return (
<View style={styles.permissionContainer}>
<Icon name="camera-off" size={60} color="#666" />
<Text style={styles.permissionText}>Camera permission required</Text>
<Text style={styles.permissionSubtext}>Please enable camera access in settings</Text>
</View>
);
}

if (scannedMaterial && scanned) {
return (
<MaterialDetails
material={scannedMaterial}
onBack={() => {
setScannedMaterial(null);
setScanned(false);
}}
onScanAnother={() => {
setScannedMaterial(null);
setScanned(false);
}}
/>
);
}

return (
<View style={styles.container}>
<Camera
ref={cameraRef}
style={styles.camera}
type={cameraType}
flashMode={flashMode}
onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
barCodeScannerSettings={{
barCodeTypes: [
BarCodeScanner.Constants.BarCodeType.qr,
BarCodeScanner.Constants.BarCodeType.code128,
BarCodeScanner.Constants.BarCodeType.code39,
BarCodeScanner.Constants.BarCodeType.ean13,
BarCodeScanner.Constants.BarCodeType.upc_a,
],
}}
>
<View style={styles.overlay}>
<View style={styles.topControls}>
<TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
<Icon
name={flashMode === Camera.Constants.FlashMode.torch ? "flash" : "flash-off"}
size={24}
color="#fff"
/>
</TouchableOpacity>

text
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <Icon name="camera-flip" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.scanFrameContainer}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.scanText}>Align barcode/QR within frame</Text>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => setScanned(false)}
        >
          <Icon name="qrcode-scan" size={30} color="#fff" />
          <Text style={styles.scanButtonText}>Tap to scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => {
            Alert.prompt(
              "Manual Entry",
              "Enter material code:",
              (code) => {
                if (code) {
                  handleBarCodeScanned({ type: 'manual', data: code });
                }
              }
            );
          }}
        >
          <Icon name="keyboard" size={20} color="#fff" />
          <Text style={styles.manualButtonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Camera>
</View>
);
};

const styles = StyleSheet.create({
container: { flex: 1 },
permissionContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#f5f5f5'
},
permissionText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 10 },
permissionSubtext: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
camera: { flex: 1 },
overlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.3)',
justifyContent: 'space-between'
},
topControls: {
flexDirection: 'row',
justifyContent: 'space-between',
padding: 20,
paddingTop: 40
},
controlButton: {
backgroundColor: 'rgba(0,0,0,0.5)',
width: 44,
height: 44,
borderRadius: 22,
justifyContent: 'center',
alignItems: 'center'
},
scanFrameContainer: {
alignItems: 'center',
justifyContent: 'center'
},
scanFrame: {
width: 250,
height: 250,
borderWidth: 2,
borderColor: 'rgba(255,255,255,0.5)',
backgroundColor: 'rgba(255,255,255,0.05)',
position: 'relative',
marginBottom: 20
},
corner: {
position: 'absolute',
width: 30,
height: 30,
borderColor: '#2196F3'
},
topLeft: {
top: -2,
left: -2,
borderTopWidth: 4,
borderLeftWidth: 4
},
topRight: {
top: -2,
right: -2,
borderTopWidth: 4,
borderRightWidth: 4
},
bottomLeft: {
bottom: -2,
left: -2,
borderBottomWidth: 4,
borderLeftWidth: 4
},
bottomRight: {
bottom: -2,
right: -2,
borderBottomWidth: 4,
borderRightWidth: 4
},
scanText: {
color: '#fff',
fontSize: 14,
backgroundColor: 'rgba(0,0,0,0.5)',
paddingHorizontal: 15,
paddingVertical: 5,
borderRadius: 15
},
bottomControls: {
alignItems: 'center',
paddingBottom: 40
},
scanButton: {
alignItems: 'center',
marginBottom: 20
},
scanButtonText: {
color: '#fff',
fontSize: 14,
marginTop: 5,
fontWeight: '500'
},
manualButton: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: 'rgba(33, 150, 243, 0.8)',
paddingHorizontal: 20,
paddingVertical: 10,
borderRadius: 25
},
manualButtonText: {
color: '#fff',
fontSize: 14,
fontWeight: '500',
marginLeft: 8
}
});

export default MaterialScanner;

