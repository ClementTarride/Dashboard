const dashboardNameInput = document.getElementById("dashboard-name");
const dashboardSourceInput = document.getElementById("dashboard-source");
const dashboardDomainInput = document.getElementById("dashboard-domain");
const dashboardVisibilityInput = document.getElementById("dashboard-visibility");
const dashboardStatusInput = document.getElementById("dashboard-status");

const previewName = document.getElementById("preview-name");
const previewSource = document.getElementById("preview-source");
const previewDomain = document.getElementById("preview-domain");
const previewVisibility = document.getElementById("preview-visibility");
const previewStatus = document.getElementById("preview-status");

function getSelectedText(selectElement) {
    if (!selectElement) return "—";
    const option = selectElement.options[selectElement.selectedIndex];
    return option && option.value ? option.text : "—";
}

function updateDashboardPreview() {
    previewName.textContent = dashboardNameInput.value.trim() || "Non défini";
    previewSource.textContent = getSelectedText(dashboardSourceInput);
    previewDomain.textContent = getSelectedText(dashboardDomainInput);
    previewVisibility.textContent = getSelectedText(dashboardVisibilityInput);
    previewStatus.textContent = getSelectedText(dashboardStatusInput);
}

if (dashboardNameInput) {
    dashboardNameInput.addEventListener("input", updateDashboardPreview);
}

if (dashboardSourceInput) {
    dashboardSourceInput.addEventListener("change", updateDashboardPreview);
}

if (dashboardDomainInput) {
    dashboardDomainInput.addEventListener("change", updateDashboardPreview);
}

if (dashboardVisibilityInput) {
    dashboardVisibilityInput.addEventListener("change", updateDashboardPreview);
}

if (dashboardStatusInput) {
    dashboardStatusInput.addEventListener("change", updateDashboardPreview);
}

updateDashboardPreview();