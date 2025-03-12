import * as THREE from "../libs/three123/three.module.js";
import { ARButton } from "../libs/jsm/ARButton.js";
import { loadModel } from "./modelLoader.js";
import { TransformControls } from "./transformControls.js";
import { HitTestManager } from "./hitTestManager.js";
import { InteractionHandler } from "./interactionHandler.js";
import { itemCategories } from "./modelLibrary.js";

document.addEventListener("DOMContentLoaded", () => {
    const initialize = async () => {
        // Setup Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Add lights
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        scene.add(light);
        scene.add(directionalLight);

        // Initialize AR button
        const arButton = ARButton.createButton(renderer, {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body },
            sessionInit: {
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            }
        });
        document.body.appendChild(arButton);

        // Initialize managers
        const interactionHandler = new InteractionHandler(scene);
        const transformControls = new TransformControls(camera);
        const hitTestManager = new HitTestManager(renderer);

        // Create reticle
        const reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        reticle.visible = false;
        reticle.matrixAutoUpdate = false;
        scene.add(reticle);

        // Setup UI elements
        const menuButton = document.getElementById("menu-button");
        const closeButton = document.getElementById("close-button");
        const bottomMenu = document.getElementById("bottomMenu");
        const confirmButtons = document.getElementById("confirm-buttons");
        const placeButton = document.getElementById("place");
        const cancelButton = document.getElementById("cancel");
        const deleteButton = document.getElementById("delete-button");
        const surfaceIndicator = document.getElementById("surface-indicator");
        const statusMessage = document.getElementById("status-message");

        // AR session events
        renderer.xr.addEventListener("sessionstart", () => {
            console.log("AR session started");
        });
        
        renderer.xr.addEventListener("sessionend", () => {
            console.log("AR session ended");
        });

        // Touch events for model manipulation
        renderer.domElement.addEventListener('touchstart', (event) => {
            transformControls.onTouchStart(event, interactionHandler.getPlacedItems(), scene, deleteButton);
        }, false);
        
        renderer.domElement.addEventListener('touchmove', (event) => {
            transformControls.onTouchMove(event);
        }, false);
        
        renderer.domElement.addEventListener('touchend', (event) => {
            transformControls.onTouchEnd(event, deleteButton);
        }, false);

        // Menu click event
        document.addEventListener("click", (event) => {
            const isClickInsideMenu = bottomMenu?.contains(event.target);
            const isClickOnMenuButton = menuButton?.contains(event.target);
            const isMenuOpen = bottomMenu?.classList.contains("open");
            if (!isClickInsideMenu && !isClickOnMenuButton && isMenuOpen) {
                bottomMenu.classList.remove("open");
                closeButton.style.display = "none";
                menuButton.style.display = "block";
                reticle.visible = false;
            }
        });

        menuButton.addEventListener("click", (event) => {
            event.stopPropagation();
            bottomMenu.classList.add("open");
            menuButton.style.display = "none";
            closeButton.style.display = "block";
        });

        closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            bottomMenu.classList.remove("open");
            closeButton.style.display = "none";
            menuButton.style.display = "block";
            if (!interactionHandler.isModelCurrentlySelected()) {
                reticle.visible = false;
            }
        });

        // Setup submenu interactions
        const icons = document.querySelectorAll(".icon");
        icons.forEach((icon) => {
            icon.addEventListener("click", (event) => {
                event.stopPropagation();
                const clickedSubmenu = icon.querySelector(".submenu");
                document.querySelectorAll('.submenu').forEach(submenu => {
                    if (submenu !== clickedSubmenu) {
                        submenu.classList.remove('open');
                    }
                });
                clickedSubmenu.classList.toggle("open");
            });
        });

        // Place, cancel, and delete buttons
        placeButton.addEventListener("click", () => {
            if (interactionHandler.placeModel(reticle)) {
                confirmButtons.style.display = "none";
                surfaceIndicator.textContent = "";
            } else {
                surfaceIndicator.textContent = "Please point at a surface";
            }
        });
        
        cancelButton.addEventListener("click", () => {
            interactionHandler.cancelModel();
            confirmButtons.style.display = "none";
            reticle.visible = false;
        });
        
        deleteButton.addEventListener("click", () => {
            interactionHandler.deleteModel(transformControls.getSelectedObject());
            transformControls.clearSelectedObject();
            deleteButton.style.display = "none";
        });

        // Load all models
        const loadedModels = new Map();
        for (const category of Object.keys(itemCategories)) {
            for (let i = 1; i <= 5; i++) {
                const itemName = `${category}${i}`;
                const model = await loadModel(category, itemName);
                
                if (model) {
                    loadedModels.set(`${category}-${itemName}`, model);
                    
                    // Add click event to thumbnail
                    const thumbnail = document.querySelector(`#${category}-${itemName}`);
                    if (thumbnail) {
                        thumbnail.addEventListener("click", (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const modelToShow = loadedModels.get(`${category}-${itemName}`);
                            
                            if (modelToShow) {
                                try {
                                    const modelClone = modelToShow.clone(true);
                                    interactionHandler.showModel(modelClone);
                                    confirmButtons.style.display = "flex";
                                    // Ensure reticle becomes visible if in AR mode
                                    if (renderer.xr.isPresenting) {
                                        reticle.visible = true;
                                    }
                                } catch (cloneError) {
                                    console.error(`Error cloning model on click: ${category}/${itemName}`, cloneError);
                                }
                            } else {
                                console.error(`Model not found when clicked: ${category}/${itemName}`);
                            }
                        });
                    }
                }
            }
        }

        // Animation loop
        renderer.setAnimationLoop((timestamp, frame) => {
            if (frame) {
                const referenceSpace = renderer.xr.getReferenceSpace();
                const session = renderer.xr.getSession();
                
                // Initialize hit test source if needed
                hitTestManager.initialize(renderer, session);

                // Update hit test results
                hitTestManager.update(
                    frame, 
                    referenceSpace, 
                    reticle, 
                    interactionHandler.getPreviewItem(), 
                    interactionHandler.isModelCurrentlySelected(),
                    surfaceIndicator
                );
            }
            
            renderer.render(scene, camera);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    initialize().catch(console.error);
});
