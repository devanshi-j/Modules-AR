import * as THREE from "../libs/three123/three.module.js";

export class TransformControls {
    constructor(camera) {
        this.camera = camera;
        this.selectedObject = null;
        this.isDragging = false;
        this.isRotating = false;
        this.isScaling = false;
        this.previousTouchX = 0;
        this.previousTouchY = 0;
        this.previousPinchDistance = 0;
        this.raycaster = new THREE.Raycaster();
        this.touches = new THREE.Vector2();
    }

    onTouchStart(event, placedItems, scene, deleteButton) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            this.touches.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
            this.touches.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.touches, this.camera);
            const intersects = this.raycaster.intersectObjects(placedItems, true);
            
            if (intersects.length > 0) {
                let parent = intersects[0].object;
                while (parent.parent && parent.parent !== scene) {
                    parent = parent.parent;
                }
                
                this.selectedObject = parent;
                this.isRotating = true;
                this.previousTouchX = event.touches[0].pageX;
                this.isScaling = false;
                this.isDragging = false;
                
                deleteButton.style.left = `${event.touches[0].pageX - 40}px`;
                deleteButton.style.top = `${event.touches[0].pageY - 60}px`;
                deleteButton.style.display = "block";
            } else {
                this.selectedObject = null;
                deleteButton.style.display = "none";
            }
        } else if (event.touches.length === 2 && this.selectedObject) {
            this.isRotating = false;
            
            // Calculate initial position for dragging
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            this.previousTouchX = (touch1.pageX + touch2.pageX) / 2;
            this.previousTouchY = (touch1.pageY + touch2.pageY) / 2;
            
            // Calculate initial distance for scaling
            this.previousPinchDistance = this.getTouchDistance(touch1, touch2);
            
            // Set the gesture mode
            const touchDistance = this.getTouchDistance(touch1, touch2);
            if (touchDistance < 100) {
                this.isDragging = true;
                this.isScaling = false;
            } else {
                this.isScaling = true;
                this.isDragging = false;
            }
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        
        if (this.isRotating && event.touches.length === 1 && this.selectedObject) {
            const deltaX = event.touches[0].pageX - this.previousTouchX;
            this.selectedObject.rotateY(deltaX * 0.005);
            this.previousTouchX = event.touches[0].pageX;
        } 
        else if (event.touches.length === 2 && this.selectedObject) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            if (this.isDragging) {
                const currentCenterX = (touch1.pageX + touch2.pageX) / 2;
                const currentCenterY = (touch1.pageY + touch2.pageY) / 2;
                
                const deltaX = (currentCenterX - this.previousTouchX) * 0.01;
                const deltaZ = (currentCenterY - this.previousTouchY) * 0.01;
                
                this.selectedObject.position.x += deltaX;
                this.selectedObject.position.z += deltaZ;
                
                this.previousTouchX = currentCenterX;
                this.previousTouchY = currentCenterY;
            }
            else if (this.isScaling) {
                const currentPinchDistance = this.getTouchDistance(touch1, touch2);
                const scaleFactor = currentPinchDistance / this.previousPinchDistance;
                
                if (scaleFactor !== 1) {
                    // Fix the typo in the original code: xcd -> x
                    const newScale = this.selectedObject.scale.x * scaleFactor;
                    if (newScale >= 0.5 && newScale <= 2) {
                        this.selectedObject.scale.setScalar(newScale);
                    }
                }
                
                this.previousPinchDistance = currentPinchDistance;
            }
        }
    }

    onTouchEnd(event, deleteButton) {
        if (event.touches.length === 0) {
            this.isRotating = false;
            this.isDragging = false;
            this.isScaling = false;
            
            if (!this.selectedObject) {
                deleteButton.style.display = "none";
            }
        }
        // If one finger remains, switch back to rotation
        else if (event.touches.length === 1 && this.selectedObject) {
            this.isRotating = true;
            this.isDragging = false;
            this.isScaling = false;
            this.previousTouchX = event.touches[0].pageX;
        }
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getSelectedObject() {
        return this.selectedObject;
    }

    clearSelectedObject() {
        this.selectedObject = null;
    }
}
