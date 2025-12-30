import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { IFCLoader } from 'web-ifc-three';

export class BIMService {
constructor(containerId) {
this.container = document.getElementById(containerId);
this.scene = null;
this.camera = null;
this.renderer = null;
this.controls = null;
this.models = new Map();
this.isInitialized = false;
}

async initialize() {
if (this.isInitialized) {
console.warn('BIMService already initialized');
return;
}

text
// Create scene
this.scene = new THREE.Scene();
this.scene.background = new THREE.Color(0xf0f0f0);

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
this.scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
this.scene.add(directionalLight);

// Create camera
const width = this.container.clientWidth;
const height = this.container.clientHeight;

this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
this.camera.position.set(10, 10, 10);
this.camera.lookAt(0, 0, 0);

// Create renderer
this.renderer = new THREE.WebGLRenderer({ antialias: true });
this.renderer.setSize(width, height);
this.renderer.setPixelRatio(window.devicePixelRatio);
this.renderer.shadowMap.enabled = true;
this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

this.container.appendChild(this.renderer.domElement);

// Add window resize handler
window.addEventListener('resize', () => this.onWindowResize());

this.isInitialized = true;
console.log('BIMService initialized');

// Start animation loop
this.animate();
}

async loadModel(file, fileType = 'gltf') {
if (!this.isInitialized) {
await this.initialize();
}

text
return new Promise((resolve, reject) => {
  try {
    let loader;
    
    switch (fileType.toLowerCase()) {
      case 'gltf':
      case 'glb':
        loader = new GLTFLoader();
        break;
        
      case 'ifc':
        loader = new IFCLoader();
        loader.ifcManager.setWasmPath('/wasm/');
        break;
        
      default:
        reject(new Error(`Unsupported file type: ${fileType}`));
        return;
    }

    loader.load(
      URL.createObjectURL(file),
      (model) => {
        const modelId = `model_${Date.now()}`;
        this.models.set(modelId, model);
        
        if (model.scene) {
          this.scene.add(model.scene);
          
          // Center model and adjust camera
          const box = new THREE.Box3().setFromObject(model.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          model.scene.position.sub(center);
          
          // Adjust camera to fit model
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = this.camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
          
          this.camera.position.z = cameraZ * 1.5;
          this.camera.lookAt(0, 0, 0);
          
          resolve({ id: modelId, model, metadata: { size, center } });
        } else {
          resolve({ id: modelId, model });
        }
      },
      (progress) => {
        console.log(`Loading progress: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
      },
      (error) => {
        reject(new Error(`Failed to load model: ${error.message}`));
      }
    );
  } catch (error) {
    reject(error);
  }
});
}

async extractModelData(modelId) {
const model = this.models.get(modelId);
if (!model) {
throw new Error(Model not found: ${modelId});
}

text
const data = {
  elements: [],
  materials: [],
  dimensions: {}
};

// Traverse model and extract information
model.scene.traverse((child) => {
  if (child.isMesh) {
    // Extract element data
    const element = {
      id: child.uuid,
      name: child.name || 'Unnamed Element',
      type: child.userData.type || 'Unknown',
      material: child.material.name || 'Default',
      geometry: {
        vertices: child.geometry.attributes.position.count,
        faces: child.geometry.index ? child.geometry.index.count / 3 : 0
      },
      position: child.position.toArray(),
      rotation: child.rotation.toArray(),
      scale: child.scale.toArray()
    };
    
    data.elements.push(element);

    // Extract material if not already added
    if (child.material && !data.materials.some(m => m.name === child.material.name)) {
      data.materials.push({
        name: child.material.name,
        type: child.material.type,
        color: child.material.color,
        opacity: child.material.opacity
      });
    }

    // Calculate bounding box for dimensions
    const box = new THREE.Box3().setFromObject(child);
    const size = box.getSize(new THREE.Vector3());
    
    if (!data.dimensions[element.type]) {
      data.dimensions[element.type] = [];
    }
    
    data.dimensions[element.type].push({
      id: element.id,
      width: size.x,
      height: size.y,
      depth: size.z,
      volume: size.x * size.y * size.z
    });
  }
});

// Calculate overall dimensions
const overallBox = new THREE.Box3().setFromObject(model.scene);
const overallSize = overallBox.getSize(new THREE.Vector3());

data.overallDimensions = {
  width: overallSize.x,
  height: overallSize.y,
  depth: overallSize.z,
  volume: overallSize.x * overallSize.y * overallSize.z
};

return data;
}

async highlightElement(modelId, elementId, color = 0xff0000) {
const model = this.models.get(modelId);
if (!model) return;

text
model.scene.traverse((child) => {
  if (child.uuid === elementId && child.isMesh) {
    // Store original material
    if (!child.userData.originalMaterial) {
      child.userData.originalMaterial = child.material;
    }
    
    // Apply highlight material
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7
    });
    
    child.material = highlightMaterial;
  }
});
}

async clearHighlight(modelId, elementId) {
const model = this.models.get(modelId);
if (!model) return;

text
model.scene.traverse((child) => {
  if (child.uuid === elementId && child.isMesh && child.userData.originalMaterial) {
    child.material = child.userData.originalMaterial;
    delete child.userData.originalMaterial;
  }
});
}

async takeScreenshot(filename = 'bim-screenshot') {
if (!this.isInitialized) return null;

text
this.renderer.render(this.scene, this.camera);
const dataURL = this.renderer.domElement.toDataURL('image/png');

// Create download link
const link = document.createElement('a');
link.href = dataURL;
link.download = `${filename}_${Date.now()}.png`;
link.click();

return dataURL;
}

onWindowResize() {
if (!this.isInitialized) return;

text
const width = this.container.clientWidth;
const height = this.container.clientHeight;

this.camera.aspect = width / height;
this.camera.updateProjectionMatrix();
this.renderer.setSize(width, height);
}

animate() {
if (!this.isInitialized) return;

text
requestAnimationFrame(() => this.animate());
this.renderer.render(this.scene, this.camera);
}

dispose() {
// Clean up Three.js resources
this.models.forEach((model) => {
if (model.scene) {
model.scene.traverse((child) => {
if (child.isMesh) {
child.geometry.dispose();

text
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
});

this.models.clear();

if (this.renderer) {
  this.renderer.dispose();
}

this.isInitialized = false;
console.log('BIMService disposed');
}
}
