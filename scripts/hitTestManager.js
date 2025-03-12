import * as THREE from "../libs/three123/three.module.js";

export class HitTestManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
    }

    initialize(renderer, session) {
        if (!this.hitTestSourceRequested) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    this.hitTestSource = source;
                    console.log("Hit test source acquired");
                });
            });
            this.hitTestSourceRequested = true;
        }
    }

    update(frame, referenceSpace, reticle, previewItem, isModelSelected, surfaceIndicator) {
        if (!this.hitTestSource) return false;

        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        
        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            if (isModelSelected) {
                const hitPose = hit.getPose(referenceSpace);
                reticle.visible = true;
                reticle.matrix.fromArray(hitPose.transform.matrix);
                
                if (previewItem) {
                    const position = new THREE.Vector3();
                    const rotation = new THREE.Quaternion();
                    const scale = new THREE.Vector3();
                    reticle.matrix.decompose(position, rotation, scale);
                    
                    previewItem.position.copy(position);
                    previewItem.quaternion.copy(rotation);
                    surfaceIndicator.textContent = "Tap 'Place' to position the model";
                }
            }
            return true;
        } else {
            reticle.visible = false;
            if (isModelSelected) {
                surfaceIndicator.textContent = "Point at a surface to place the model";
            }
            return false;
        }
    }
}
