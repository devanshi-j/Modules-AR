// Core state management for multiple models
const loadedModels = new Map();
const placedItems = [];
let previewItem = null;
let isModelSelected = false;

// Normalize model size to desired height
const normalizeModel = (obj, height) => {
    const bbox = new THREE.Box3().setFromObject(obj);
    const size = bbox.getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(height / size.y);
    const bbox2 = new THREE.Box3().setFromObject(obj);
    const center = bbox2.getCenter(new THREE.Vector3());
    obj.position.set(-center.x, -center.y, -center.z);
};

// Load models based on configuration
const loadModels = async (modelConfig) => {
    for (const [category, models] of Object.entries(modelConfig)) {
        for (const model of models) {
            try {
                const gltf = await loadGLTF(`../assets/models/${category}/${model.name}/scene.gltf`);
                normalizeModel(gltf.scene, model.height);
                const item = new THREE.Group();
                item.add(gltf.scene);
                loadedModels.set(`${category}-${model.name}`, item);
            } catch (error) {
                console.error(`Error loading model ${category}/${model.name}:`, error);
            }
        }
    }
};

// Show preview of selected model
const showModel = (modelKey) => {
    if (previewItem) {
        scene.remove(previewItem);
    }
    const model = loadedModels.get(modelKey);
    if (model) {
        previewItem = model.clone(true);
        scene.add(previewItem);
        isModelSelected = true;
    }
};

// Place model in AR space
const placeModel = () => {
    if (previewItem && reticle.visible) {
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        reticle.matrix.decompose(position, rotation, scale);
        
        const placedModel = previewItem.clone(true);
        placedModel.position.copy(position);
        placedModel.quaternion.copy(rotation);
        
        // Ensure placed model is fully opaque
        placedModel.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });
        
        scene.add(placedModel);
        placedItems.push(placedModel);
        
        // Cleanup preview
        scene.remove(previewItem);
        previewItem = null;
        isModelSelected = false;
    }
};

// Delete placed model
const deleteModel = (selectedObject) => {
    if (selectedObject) {
        scene.remove(selectedObject);
        placedItems = placedItems.filter(item => item !== selectedObject);
    }
};

// Example model configuration
const modelConfig = {
    table: [
        { name: "table1", height: 0.5 },
        { name: "table2", height: 0.5 }
    ],
    chair: [
        { name: "chair1", height: 0.5 },
        { name: "chair2", height: 0.5 }
    ]
};

// Usage example:
// 1. Load models
await loadModels(modelConfig);

// 2. Show model preview when selected from UI
showModel('table-table1');

// 3. Place model when confirmed
placeModel();

// 4. Delete model when needed
deleteModel(selectedObject);
