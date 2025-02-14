// dragging-handler.js
export class DraggingHandler {
    constructor() {
        this.selectedObject = null;
        this.isDragging = false;
        this.previousTouchX = 0;
        this.previousTouchY = 0;
        this.movementSpeed = 0.01;
    }

    startDragging(object, event) {
        if (event.touches.length !== 2) return false;
        
        this.selectedObject = object;
        this.isDragging = true;
        const centerX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        const centerY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        this.previousTouchX = centerX;
        this.previousTouchY = centerY;
        return true;
    }

    updateDragging(event) {
        if (!this.isDragging || event.touches.length !== 2 || !this.selectedObject) return;

        const currentCenterX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        const currentCenterY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        
        const deltaX = (currentCenterX - this.previousTouchX) * this.movementSpeed;
        const deltaY = (currentCenterY - this.previousTouchY) * this.movementSpeed;
        
        this.selectedObject.position.x += deltaX;
        this.selectedObject.position.z += deltaY;
        
        this.previousTouchX = currentCenterX;
        this.previousTouchY = currentCenterY;
    }

    stopDragging() {
        this.isDragging = false;
        this.selectedObject = null;
    }

    setMovementSpeed(speed) {
        this.movementSpeed = speed;
    }
}
