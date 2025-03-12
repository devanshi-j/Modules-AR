import * as THREE from "../libs/three123/three.module.js";
import { setOpacityForSelected } from "./modelLoader.js";

export class InteractionHandler {
    constructor(scene) {
        this.scene = scene;
        this.previewItem = null;
        this.placedItems = [];
        this.selectedModels = [];
        this.isModelSelected = false;
    }

    selectModel(model) {
        this.selectedModels = [model]; // Reset and add only the current model
        console.log("Model selected:", model);
        console.log("Updated selectedModels:", this.selectedModels);
    }

    showModel(item) {
        if (this.previewItem) {
            this.scene.remove(this.previewItem);
        }

        this.selectModel(item);
        console.log("showModel() called. Selected models:", this.selectedModels);
        
        this.previewItem = item;
        this.scene.add(this.previewItem);
        
        setOpacityForSelected(this.selectedModels, 0.5);

        this.isModelSelected = true;
        return this.previewItem;
    }

    placeModel(reticle) {
        console.log("placeModel() called. Current selectedModels:", this.selectedModels);
        console.log("Preview item:", this.previewItem);
        console.log("Reticle visible:", reticle.visible);

        if (!this.previewItem) {
            console.warn("No preview item available");
            return false;
        }

        if (!reticle.visible) {
            console.warn("Reticle is not visible - waiting for surface");
            return false;
        }

        // Create a clone of the preview item
        const placedModel = this.previewItem.clone();
        
        // Get reticle position & rotation
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        reticle.matrix.decompose(position, rotation, scale);

        // Set the position and rotation of the placed model
        placedModel.position.copy(position);
        placedModel.quaternion.copy(rotation);

        // Make it fully opaque
        placedModel.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });

        // Add to scene and placed items array
        this.scene.add(placedModel);
        this.placedItems.push(placedModel);

        // Reset states
        this.scene.remove(this.previewItem);
        this.previewItem = null;
        this.selectedModels = [];
        this.isModelSelected = false;

        console.log("Model placed successfully");
        return true;
    }

    cancelModel() {
        if (this.previewItem) {
            this.scene.remove(this.previewItem);
            this.previewItem = null;
        }
        this.isModelSelected = false;
        return true;
    }

    deleteModel(selectedObject) {
        if (selectedObject) {
            this.scene.remove(selectedObject);
            this.placedItems = this.placedItems.filter(item => item !== selectedObject);
            return true;
        }
        return false;
    }

    getPlacedItems() {
        return this.placedItems;
    }

    getPreviewItem() {
        return this.previewItem;
    }

    isModelCurrentlySelected() {
        return this.isModelSelected;
    }
}
