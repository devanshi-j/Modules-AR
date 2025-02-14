// model-placement-handler.js
import * as THREE from 'three';

export class ModelPlacementHandler {
    constructor(scene) {
        this.scene = scene;
        this.placedItems = [];
        this.previewItem = null;
    }

    showPreview(model) {
        if (this.previewItem) {
            this.scene.remove(this.previewItem);
        }
        
        this.previewItem = model.clone();
        this.previewItem.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.5;
            }
        });
        
        this.scene.add(this.previewItem);
        return this.previewItem;
    }

    placeModel(reticle) {
        if (!this.previewItem || !reticle.visible) return null;

        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        reticle.matrix.decompose(position, rotation, scale);
        
        const placedModel = this.previewItem.clone();
        placedModel.position.copy(position);
        placedModel.quaternion.copy(rotation);
        
        // Make the placed model fully opaque
        placedModel.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });
        
        this.scene.add(placedModel);
        this.placedItems.push(placedModel);
        
        // Clean up preview
        this.cancelPlacement();
        
        return placedModel;
    }

    cancelPlacement() {
        if (this.previewItem) {
            this.scene.remove(this.previewItem);
            this.previewItem = null;
        }
    }

    deleteModel(model) {
        if (!model) return false;
        
        this.scene.remove(model);
        this.placedItems = this.placedItems.filter(item => item !== model);
        return true;
    }

    getPlacedItems() {
        return this.placedItems;
    }

    getPreviewItem() {
        return this.previewItem;
    }
}
