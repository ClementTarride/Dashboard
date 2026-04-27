const objectSearch = document.getElementById("objectSearch");
const objectCards = document.querySelectorAll(".object-card");
const filterChips = document.querySelectorAll(".filter-chip");

const objectModal = document.getElementById("objectModal");
const closeObjectModal = document.getElementById("closeObjectModal");

const modalObjectName = document.getElementById("modalObjectName");
const modalObjectSubtitle = document.getElementById("modalObjectSubtitle");
const modalInfoList = document.getElementById("modalInfoList");
const modalDescription = document.getElementById("modalDescription");
const modalTags = document.getElementById("modalTags");
const modalDetailTitle = document.getElementById("modalDetailTitle");
const modalDetailTable = document.getElementById("modalDetailTable");
const modalSqlPreview = document.getElementById("modalSqlPreview");
const modalPreviewTable = document.getElementById("modalPreviewTable");

let activeFilter = "all";

function updateObjectVisibility() {
    const query = objectSearch ? objectSearch.value.toLowerCase().trim() : "";

    objectCards.forEach((card) => {
        const name = (card.dataset.name || "").toLowerCase();
        const type = (card.dataset.type || "").toLowerCase();
        const source = (card.dataset.source || "").toLowerCase();
        const schema = (card.dataset.schema || "").toLowerCase();
        const content = card.textContent.toLowerCase();

        const matchesSearch =
            !query ||
            name.includes(query) ||
            type.includes(query) ||
            source.includes(query) ||
            schema.includes(query) ||
            content.includes(query);

        let matchesFilter = false;

        if (activeFilter === "all") {
            matchesFilter = true;
        } else if (activeFilter === "table" || activeFilter === "function") {
            matchesFilter = type === activeFilter;
        } else {
            matchesFilter = source === activeFilter;
        }

        card.classList.toggle("hidden-card", !(matchesSearch && matchesFilter));
    });
}

if (objectSearch) {
    objectSearch.addEventListener("input", updateObjectVisibility);
}

filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        filterChips.forEach((btn) => btn.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        updateObjectVisibility();
    });
});

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

function buildDetailTable(type, rows) {
    modalDetailTable.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");

    const headers =
        type === "table"
            ? ["Colonne", "Type SQL", "Nullable", "Clé primaire"]
            : ["Élément", "Type", "Nature", "Description"];

    headers.forEach((headerText) => {
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

    modalDetailTable.appendChild(thead);
    modalDetailTable.appendChild(tbody);
}

function buildPreviewTable(columns, rows) {
    modalPreviewTable.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column;
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

function openModalFromCard(card) {
    const type = card.dataset.type || "";
    const name = card.dataset.name || "";
    const sourceLabel = card.dataset.sourceLabel || "";
    const schema = card.dataset.schema || "";
    const description = card.dataset.description || "";
    const columns = card.dataset.columns || "";
    const primaryKey = card.dataset.primaryKey || "";
    const lastAnalysis = card.dataset.lastAnalysis || "";
    const signature = card.dataset.signature || "";
    const returnType = card.dataset.returnType || "";
    const sql = card.dataset.sql || "";
    const detailTitle = card.dataset.detailTitle || "Structure";
    const detailContent = JSON.parse(card.dataset.detailContent || "[]");
    const previewColumns = JSON.parse(card.dataset.previewColumns || "[]");
    const previewRows = JSON.parse(card.dataset.previewRows || "[]");

    modalObjectName.textContent = name;
    modalObjectSubtitle.textContent = `${sourceLabel} • ${schema} • ${type === "table" ? "Table" : "Fonction"}`;

    modalInfoList.innerHTML = "";
    modalInfoList.appendChild(createInfoRow("Type", type === "table" ? "Table" : "Fonction stockée"));
    modalInfoList.appendChild(createInfoRow("Source", sourceLabel));
    modalInfoList.appendChild(createInfoRow("Schéma", schema));

    if (type === "table") {
        modalInfoList.appendChild(createInfoRow("Colonnes", columns));
        modalInfoList.appendChild(createInfoRow("Clé primaire", primaryKey));
    } else {
        modalInfoList.appendChild(createInfoRow("Signature", signature));
        modalInfoList.appendChild(createInfoRow("Retour", returnType));
    }

    modalInfoList.appendChild(createInfoRow("Dernière analyse", lastAnalysis));

    modalDescription.textContent = description;

    modalTags.innerHTML = "";
    const tags = [
        type === "table" ? "Table" : "Fonction",
        sourceLabel,
        schema
    ];

    if (type === "table" && primaryKey) {
        tags.push(`PK: ${primaryKey}`);
    }

    if (type === "function" && returnType) {
        tags.push(`Retour: ${returnType}`);
    }

    tags.forEach((tagText) => {
        const span = document.createElement("span");
        span.className = "modal-tag";
        span.textContent = tagText;
        modalTags.appendChild(span);
    });

    modalDetailTitle.textContent = detailTitle;
    buildDetailTable(type, detailContent);

    modalSqlPreview.textContent = sql;
    buildPreviewTable(previewColumns, previewRows);

    objectModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

objectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button");
        if (clickedButton && clickedButton.classList.contains("icon-btn")) {
            event.stopPropagation();
            return;
        }
        openModalFromCard(card);
    });

    const modalButtons = card.querySelectorAll(".open-object-modal-btn");
    modalButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            openModalFromCard(card);
        });
    });
});

function closeModal() {
    objectModal.classList.remove("active");
    document.body.style.overflow = "";
}

if (closeObjectModal) {
    closeObjectModal.addEventListener("click", closeModal);
}

if (objectModal) {
    objectModal.addEventListener("click", (event) => {
        if (event.target === objectModal) {
            closeModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && objectModal.classList.contains("active")) {
        closeModal();
    }
});

updateObjectVisibility();