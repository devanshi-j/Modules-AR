import { loadGLTF } from "../libs/loader.js";
import * as THREE from "../libs/three123/three.module.js";

export async function normalizeModel(obj, height) {
    const bbox = new THREE.Box3().setFromObject(obj);
    const size = bbox.getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(height / size.y);
    const bbox2 = new THREE.Box3().setFromObject(obj);
    const center = bbox2.getCenter(new THREE.Vector3());
    obj.position.set(-center.x, -center.y, -center.z);
}

export async function loadModel(category, itemName) {
    const baseModelPath = `../assets/models/${category}/${itemName}`;
    const glbPath = `${baseModelPath}/${itemName}.glb`;
    const gltfPath = `${baseModelPath}/scene.gltf`;
    try {
        const modelPath = await getExistingFile(glbPath, gltfPath);
        if (!modelPath) {
            console.warn(`No model found for ${category}/${itemName}`);
            return null;
        }
        console.log(`Loading model: ${modelPath}`);
        const model = await loadGLTF(modelPath);
        
        // Create a group and add the model to it
        const item = new THREE.Group();
        item.add(model.scene);
        
        // Set up shadows
        model.scene.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        
        return item;
    } catch (error) {
        console.error(`Error loading model ${category}/${itemName}:`, error);
        return null;
    }
}

async function getExistingFile(glbPath, gltfPath) {
    console.log(`Checking GLB: ${glbPath}`);
    if (await fileExists(glbPath)) {
        console.log(`GLB found: ${glbPath}`);
        return glbPath;
    }
    console.log(`Checking GLTF: ${gltfPath}`);
    if (await fileExists(gltfPath)) {
        console.log(`GLTF found: ${gltfPath}`);
        return gltfPath;
    }
    console.warn(`Neither GLB nor GLTF found.`);
    return null;
}

async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`File check response for ${url}: ${response.status}`);
        return response.ok;
    } catch (error) {
        console.error(`Error checking file existence: ${url}`, error);
        return false;
    }
}
export function setOpacityForSelected(models, opacity) {
    console.log(`setOpacityForSelected(${opacity}) called. Selected models:`, models);

    if (models.length === 0) {
        console.warn("setOpacityForSelected() - No models in selectedModels array!");
        return;
    }

    models.forEach((model) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.format = THREE.RGBAFormat;
                child.material.opacity = opacity;
            }
        });
    });
}
