// scaling-handler.js
export class ScalingHandler {
    constructor() {
        this.selectedObject = null;
        this.isScaling = false;
        this.previousPinchDistance = 0;
        this.minScale = 0.5;
        this.maxScale = 2.0;
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startScaling(object, event) {
        if (event.touches.length !== 2) return false;
        
        this.selectedObject = object;
        this.isScaling = true;
        this.previousPinchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
        return true;
    }

    updateScaling(event) {
        if (!this.isScaling || event.touches.length !== 2 || !this.selectedObject) return;

        const currentPinchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
        const scaleFactor = currentPinchDistance / this.previousPinchDistance;
        
        if (scaleFactor !== 1) {
            const newScale = this.selectedObject.scale.x * scaleFactor;
            if (newScale >= this.minScale && newScale <= this.maxScale) {
                this.selectedObject.scale.multiplyScalar(scaleFactor);
            }
        }
        
        this.previousPinchDistance = currentPinchDistance;
    }

    stopScaling() {
        this.isScaling = false;
        this.selectedObject = null;
    }

    setScaleLimits(min, max) {
        this.minScale = min;
        this.maxScale = max;
    }
}
