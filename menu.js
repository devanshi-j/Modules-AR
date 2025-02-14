// menu-handler.js
export class MenuHandler {
    constructor(elements) {
        this.elements = elements;
        this.isMenuOpen = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Global click handler for closing menu
        document.addEventListener("click", (event) => {
            const isClickInsideMenu = this.elements.sidebarMenu?.contains(event.target);
            const isClickOnMenuButton = this.elements.menuButton?.contains(event.target);
            
            if (this.isMenuOpen && !isClickInsideMenu && !isClickOnMenuButton) {
                this.closeMenu();
            }
        });

        // Menu button click handler
        this.elements.menuButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.openMenu();
        });

        // Close button click handler
        this.elements.closeButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.closeMenu();
        });

        // Icon submenu handlers
        const icons = document.querySelectorAll(".icon");
        icons.forEach((icon) => {
            icon.addEventListener("click", (event) => {
                event.stopPropagation();
                this.toggleSubmenu(icon);
            });
        });

        // Place button handler
        this.elements.placeButton?.addEventListener("click", () => {
            this.elements.onPlace?.();
            this.hideConfirmButtons();
        });

        // Cancel button handler
        this.elements.cancelButton?.addEventListener("click", () => {
            this.elements.onCancel?.();
            this.hideConfirmButtons();
        });

        // Delete button handler
        this.elements.deleteButton?.addEventListener("click", () => {
            this.elements.onDelete?.();
            this.hideDeleteButton();
        });
    }

    openMenu() {
        this.elements.sidebarMenu.classList.add("open");
        this.elements.menuButton.style.display = "none";
        this.elements.closeButton.style.display = "block";
        this.isMenuOpen = true;
    }

    closeMenu() {
        this.elements.sidebarMenu.classList.remove("open");
        this.elements.closeButton.style.display = "none";
        this.elements.menuButton.style.display = "block";
        this.isMenuOpen = false;
    }

    toggleSubmenu(icon) {
        const clickedSubmenu = icon.querySelector(".submenu");
        document.querySelectorAll('.submenu').forEach(submenu => {
            if (submenu !== clickedSubmenu) {
                submenu.classList.remove('open');
            }
        });
        clickedSubmenu.classList.toggle("open");
    }

    showConfirmButtons() {
        this.elements.confirmButtons.style.display = "flex";
    }

    hideConfirmButtons() {
        this.elements.confirmButtons.style.display = "none";
    }

    showDeleteButton(x, y) {
        this.elements.deleteButton.style.left = `${x}px`;
        this.elements.deleteButton.style.top = `${y}px`;
        this.elements.deleteButton.style.display = "block";
    }

    hideDeleteButton() {
        this.elements.deleteButton.style.display = "none";
    }
}
