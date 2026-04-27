const widgetModal = document.getElementById("widgetModal");
const openWidgetModalButtons = document.querySelectorAll(".open-widget-modal");
const closeWidgetModalButton = document.getElementById("closeWidgetModal");

function openWidgetModal() {
    widgetModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeWidgetModal() {
    widgetModal.classList.remove("active");
    document.body.style.overflow = "";
}

openWidgetModalButtons.forEach((button) => {
    button.addEventListener("click", openWidgetModal);
});

if (closeWidgetModalButton) {
    closeWidgetModalButton.addEventListener("click", closeWidgetModal);
}

if (widgetModal) {
    widgetModal.addEventListener("click", (event) => {
        if (event.target === widgetModal) {
            closeWidgetModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && widgetModal.classList.contains("active")) {
        closeWidgetModal();
    }
});