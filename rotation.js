// rotation-handler.js
import * as THREE from 'three';

export class RotationHandler {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.selectedObject = null;
        this.isRotating = false;
        this.previousTouchX = 0;
        this.raycaster = new THREE.Raycaster();
        this.touches = new THREE.Vector2();
    }

    startRotation(event, placedItems) {
        if (event.touches.length !== 1) return;
        
        // Calculate touch coordinates
        this.touches.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
        this.touches.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.touches, this.camera);
        const intersects = this.raycaster.intersectObjects(placedItems, true);
        
        if (intersects.length > 0) {
            let parent = intersects[0].object;
            while (parent.parent && parent.parent !== this.scene) {
                parent = parent.parent;
            }
            
            this.selectedObject = parent;
            this.isRotating = true;
            this.previousTouchX = event.touches[0].pageX;
            return true;
        }
        return false;
    }

    updateRotation(event) {
        if (!this.isRotating || event.touches.length !== 1 || !this.selectedObject) return;
        
        const deltaX = event.touches[0].pageX - this.previousTouchX;
        this.selectedObject.rotateY(deltaX * 0.005);
        this.previousTouchX = event.touches[0].pageX;
    }

    stopRotation() {
        this.isRotating = false;
        this.selectedObject = null;
    }

    getSelectedObject() {
        return this.selectedObject;
    }
}
