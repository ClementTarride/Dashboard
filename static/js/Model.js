const modelSearch = document.getElementById("modelSearch");
const modelGrid = document.getElementById("modelGrid");
let modelCards = Array.from(document.querySelectorAll(".model-card"));
const filterChips = document.querySelectorAll(".filter-chip");
const modelSort = document.getElementById("modelSort");

const modelModal = document.getElementById("modelModal");
const closeModelModal = document.getElementById("closeModelModal");

const modalModelTitle = document.getElementById("modalModelTitle");
const modalModelSubtitle = document.getElementById("modalModelSubtitle");
const modalInfoList = document.getElementById("modalInfoList");
const modalDescription = document.getElementById("modalDescription");
const modalTags = document.getElementById("modalTags");
const modalParameterTable = document.getElementById("modalParameterTable");
const modalWidgetGrid = document.getElementById("modalWidgetGrid");
const modalPreviewTable = document.getElementById("modalPreviewTable");

const logicAttribute = document.getElementById("logicAttribute");
const logicQueryCount = document.getElementById("logicQueryCount");
const logicWidgetCount = document.getElementById("logicWidgetCount");
const simulationAttribute = document.getElementById("simulationAttribute");
const buildRouteBtn = document.getElementById("buildRouteBtn");
const simulateModelBtn = document.getElementById("simulateModelBtn");
const routePreview = document.getElementById("routePreview");

let activeFilter = "all";
let activeModelCard = null;

function parseDatasetJson(value, fallback) {
    try {
        return JSON.parse(value || JSON.stringify(fallback));
    } catch (error) {
        console.warn("JSON invalide dans data-*", error);
        return fallback;
    }
}

function updateModelVisibility() {
    const query = modelSearch ? modelSearch.value.toLowerCase().trim() : "";

    modelCards.forEach((card) => {
        const title = (card.dataset.title || "").toLowerCase();
        const name = (card.dataset.name || "").toLowerCase();
        const domain = (card.dataset.domain || "").toLowerCase();
        const status = (card.dataset.status || "").toLowerCase();
        const attribute = (card.dataset.attribute || "").toLowerCase();
        const sources = (card.dataset.sources || "").toLowerCase();
        const content = card.textContent.toLowerCase();

        const matchesSearch =
            !query ||
            title.includes(query) ||
            name.includes(query) ||
            domain.includes(query) ||
            status.includes(query) ||
            attribute.includes(query) ||
            sources.includes(query) ||
            content.includes(query);

        let matchesFilter = false;

        if (activeFilter === "all") {
            matchesFilter = true;
        } else if (activeFilter === "ready" || activeFilter === "draft") {
            matchesFilter = status === activeFilter;
        } else {
            matchesFilter = domain === activeFilter;
        }

        card.classList.toggle("hidden-card", !(matchesSearch && matchesFilter));
    });
}

function sortModels() {
    if (!modelGrid || !modelSort) return;

    const sortValue = modelSort.value;

    const sortedCards = [...modelCards].sort((a, b) => {
        if (sortValue === "name") {
            return (a.dataset.title || "").localeCompare(b.dataset.title || "");
        }

        if (sortValue === "widgets") {
            return Number(b.dataset.widgetCount || 0) - Number(a.dataset.widgetCount || 0);
        }

        if (sortValue === "sources") {
            return Number(b.dataset.sourceCount || 0) - Number(a.dataset.sourceCount || 0);
        }

        if (sortValue === "status") {
            return (a.dataset.statusLabel || "").localeCompare(b.dataset.statusLabel || "");
        }

        return 0;
    });

    sortedCards.forEach((card) => modelGrid.appendChild(card));
    modelCards = sortedCards;
}

function createInfoRow(label, value) {
    const row = document.createElement("div");
    row.className = "modal-info-row";

    const left = document.createElement("span");
    left.className = "modal-info-label";
    left.textContent = label;

    const right = document.createElement("span");
    right.className = "modal-info-value";
    right.textContent = value || "—";

    row.appendChild(left);
    row.appendChild(right);

    return row;
}

function buildParameterTable(rows) {
    modalParameterTable.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    ["Paramètre", "Description", "Type", "Statut"].forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    rows.forEach((rowData) => {
        const tr = document.createElement("tr");
        rowData.forEach((cellData) => {
            const td = document.createElement("td");
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    modalParameterTable.appendChild(thead);
    modalParameterTable.appendChild(tbody);
}

function buildWidgetGrid(widgets) {
    modalWidgetGrid.innerHTML = "";

    widgets.forEach((widget, index) => {
        const card = document.createElement("article");
        card.className = "widget-card";

        const header = document.createElement("div");
        header.className = "widget-card-header";

        const title = document.createElement("h5");
        title.textContent = `${index + 1}. ${widget.title}`;

        const meta = document.createElement("div");
        meta.className = "widget-meta";

        [widget.type, widget.source, `Metric: ${widget.metric}`].forEach((item) => {
            const span = document.createElement("span");
            span.textContent = item;
            meta.appendChild(span);
        });

        header.appendChild(title);
        header.appendChild(meta);

        const body = document.createElement("div");
        body.className = "widget-card-body";

        const rule = document.createElement("p");
        rule.textContent = "Ce widget est rattaché à une seule source et reçoit les paramètres du model.";

        const query = document.createElement("pre");
        query.className = "widget-query";
        query.textContent = widget.query;

        body.appendChild(rule);
        body.appendChild(query);

        card.appendChild(header);
        card.appendChild(body);
        modalWidgetGrid.appendChild(card);
    });
}

function buildPreviewTable(rows) {
    modalPreviewTable.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    ["Champ", "Valeur simulée"].forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    rows.forEach((rowData) => {
        const tr = document.createElement("tr");
        rowData.forEach((cellData) => {
            const td = document.createElement("td");
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    modalPreviewTable.appendChild(thead);
    modalPreviewTable.appendChild(tbody);
}

function buildRoutePreview() {
    if (!activeModelCard || !routePreview) return;

    const templateRoute = activeModelCard.dataset.templateRoute || "";
    const attribute = activeModelCard.dataset.attribute || "value";
    const value = simulationAttribute.value.trim() || `{${attribute}}`;
    const preparedRoute = templateRoute.replace("{{ value }}", encodeURIComponent(value));

    routePreview.textContent = preparedRoute;
}

function openModalFromCard(card) {
    activeModelCard = card;

    const title = card.dataset.title || "";
    const domain = card.dataset.domain || "";
    const statusLabel = card.dataset.statusLabel || "";
    const attribute = card.dataset.attribute || "";
    const description = card.dataset.description || "";
    const sources = card.dataset.sources || "";
    const sourceCount = card.dataset.sourceCount || "";
    const widgetCount = card.dataset.widgetCount || "";
    const queryCount = card.dataset.queryCount || "";
    const lastUpdate = card.dataset.lastUpdate || "";
    const parameters = parseDatasetJson(card.dataset.parameters, []);
    const widgets = parseDatasetJson(card.dataset.widgets, []);
    const preview = parseDatasetJson(card.dataset.preview, []);

    modalModelTitle.textContent = title;
    modalModelSubtitle.textContent = `${attribute} • ${sourceCount} source(s) • ${statusLabel}`;

    logicAttribute.textContent = attribute;
    logicQueryCount.textContent = `${queryCount} requête(s)`;
    logicWidgetCount.textContent = `${widgetCount} widget(s)`;

    modalInfoList.innerHTML = "";
    modalInfoList.appendChild(createInfoRow("Domaine", domain));
    modalInfoList.appendChild(createInfoRow("Statut", statusLabel));
    modalInfoList.appendChild(createInfoRow("Attribut principal", attribute));
    modalInfoList.appendChild(createInfoRow("Sources", sourceCount));
    modalInfoList.appendChild(createInfoRow("Widgets", widgetCount));
    modalInfoList.appendChild(createInfoRow("Requêtes", queryCount));
    modalInfoList.appendChild(createInfoRow("Dernière MAJ", lastUpdate));

    modalDescription.textContent = description;

    modalTags.innerHTML = "";
    const tags = [
        `Attribut: ${attribute}`,
        `Domaine: ${domain}`,
        `Statut: ${statusLabel}`,
        ...sources.split(",").map((source) => source.trim()).filter(Boolean)
    ];

    tags.forEach((tagText) => {
        const span = document.createElement("span");
        span.className = "modal-tag";
        span.textContent = tagText;
        modalTags.appendChild(span);
    });

    buildParameterTable(parameters);
    buildWidgetGrid(widgets);
    buildPreviewTable(preview);

    if (simulationAttribute) {
        simulationAttribute.value = "";
    }
    buildRoutePreview();

    modelModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modelModal.classList.remove("active");
    document.body.style.overflow = "";
}

if (modelSearch) {
    modelSearch.addEventListener("input", updateModelVisibility);

    modelSearch.closest("form").addEventListener("submit", (event) => {
        event.preventDefault();
        updateModelVisibility();
    });
}

filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        filterChips.forEach((btn) => btn.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        updateModelVisibility();
    });
});

if (modelSort) {
    modelSort.addEventListener("change", () => {
        sortModels();
        updateModelVisibility();
    });
}

modelCards.forEach((card) => {
    card.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (clickedButton && clickedButton.classList.contains("icon-btn")) {
            event.stopPropagation();
            return;
        }
        openModalFromCard(card);
    });

    const modalButtons = card.querySelectorAll(".open-model-modal-btn");
    modalButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            openModalFromCard(card);
        });
    });
});

if (closeModelModal) {
    closeModelModal.addEventListener("click", closeModal);
}

if (modelModal) {
    modelModal.addEventListener("click", (event) => {
        if (event.target === modelModal) {
            closeModal();
        }
    });
}

if (buildRouteBtn) {
    buildRouteBtn.addEventListener("click", buildRoutePreview);
}

if (simulateModelBtn) {
    simulateModelBtn.addEventListener("click", () => {
        const simulationSection = document.querySelector(".simulation-box");
        if (simulationSection) {
            simulationSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
}

if (simulationAttribute) {
    simulationAttribute.addEventListener("input", buildRoutePreview);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modelModal.classList.contains("active")) {
        closeModal();
    }
});

updateModelVisibility();