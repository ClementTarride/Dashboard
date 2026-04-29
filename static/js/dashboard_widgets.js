const widgetModal = document.getElementById("widgetModal");
const openWidgetModalButtons = document.querySelectorAll(".open-widget-modal");
const closeWidgetModalButton = document.getElementById("closeWidgetModal");

function openWidgetModal() {
    if (!widgetModal) return;
    widgetModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeWidgetModal() {
    if (!widgetModal) return;
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
    if (event.key === "Escape" && widgetModal?.classList.contains("active")) {
        closeWidgetModal();
    }
});

document.addEventListener("change", function (event) {
    const select = event.target.closest(".excel-data-type");

    if (select) {
        const menu = select.closest(".excel-filter-menu");

        const textBlock = menu.querySelector(".excel-filter-text-block");
        const numberBlock = menu.querySelector(".excel-filter-number-block");
        const dateBlock = menu.querySelector(".excel-filter-date-block");

        textBlock.classList.add("hidden");
        numberBlock.classList.add("hidden");
        dateBlock.classList.add("hidden");

        if (select.value === "text") textBlock.classList.remove("hidden");
        if (select.value === "number") numberBlock.classList.remove("hidden");
        if (select.value === "date") dateBlock.classList.remove("hidden");
    }

    const numberOperator = event.target.closest(".excel-filter-number-operator");
    const dateOperator = event.target.closest(".excel-filter-date-operator");

    if (numberOperator) {
        const menu = numberOperator.closest(".excel-filter-menu");
        menu.querySelector(".excel-filter-number-value2")
            .classList.toggle("hidden", numberOperator.value !== "between");
    }

    if (dateOperator) {
        const menu = dateOperator.closest(".excel-filter-menu");
        menu.querySelector(".excel-filter-date-value2")
            .classList.toggle("hidden", dateOperator.value !== "between");
    }
});

document.addEventListener("click", function (event) {
    const button = event.target.closest(".excel-header-btn");

    if (button) {
        event.stopPropagation();

        document.querySelectorAll(".excel-filter-menu.open").forEach(menu => {
            menu.classList.remove("open");
        });

        const menu = button.parentElement.querySelector(".excel-filter-menu");
        if (!menu) return;

        const rect = button.getBoundingClientRect();
        const menuWidth = 250;
        const margin = 8;

        let left = rect.left;
        let top = rect.bottom + 6;

        if (left + menuWidth > window.innerWidth - margin) {
            left = window.innerWidth - menuWidth - margin;
        }

        if (left < margin) {
            left = margin;
        }

        menu.style.top = top + "px";
        menu.style.left = left + "px";
        menu.classList.add("open");
        return;
    }

    if (!event.target.closest(".excel-filter-menu")) {
        document.querySelectorAll(".excel-filter-menu.open").forEach(menu => {
            menu.classList.remove("open");
        });
    }

    const applyBtn = event.target.closest(".excel-apply-filter");
    const clearBtn = event.target.closest(".excel-clear-filter");
    const sortAscBtn = event.target.closest(".excel-sort-asc");
    const sortDescBtn = event.target.closest(".excel-sort-desc");

    if (applyBtn) {
        const menu = applyBtn.closest(".excel-filter-menu");
        const th = menu.closest("th");
        const table = th.closest("table");
        const colIndex = Number(th.querySelector(".excel-header-btn").dataset.column);
        const type = menu.querySelector(".excel-data-type").value;

        applyColumnFilter(table, colIndex, type, menu);
        menu.classList.remove("open");
    }

    if (clearBtn) {
        const menu = clearBtn.closest(".excel-filter-menu");
        const th = menu.closest("th");
        const table = th.closest("table");
        const colIndex = Number(th.querySelector(".excel-header-btn").dataset.column);

        clearColumnFilter(table, colIndex);
        menu.classList.remove("open");
    }

    if (sortAscBtn || sortDescBtn) {
        const menu = event.target.closest(".excel-filter-menu");
        const th = menu.closest("th");
        const table = th.closest("table");
        const colIndex = Number(th.querySelector(".excel-header-btn").dataset.column);
        const type = menu.querySelector(".excel-data-type").value;

        sortTable(table, colIndex, type, !!sortAscBtn);
        menu.classList.remove("open");
    }
});

function getFilters(table) {
    if (!table._filters) table._filters = {};
    return table._filters;
}

function applyColumnFilter(table, colIndex, type, menu) {
    const filters = getFilters(table);

    if (type === "text") {
        filters[colIndex] = {
            type,
            operator: menu.querySelector(".excel-filter-text-operator").value,
            value: menu.querySelector(".excel-filter-text-value").value.trim()
        };
    }

    if (type === "number") {
        filters[colIndex] = {
            type,
            operator: menu.querySelector(".excel-filter-number-operator").value,
            value1: menu.querySelector(".excel-filter-number-value1").value,
            value2: menu.querySelector(".excel-filter-number-value2").value
        };
    }

    if (type === "date") {
        filters[colIndex] = {
            type,
            operator: menu.querySelector(".excel-filter-date-operator").value,
            value1: menu.querySelector(".excel-filter-date-value1").value,
            value2: menu.querySelector(".excel-filter-date-value2").value
        };
    }

    table.querySelectorAll("thead .excel-header-btn")[colIndex].classList.add("filtered");
    refreshTableVisibility(table);
}

function clearColumnFilter(table, colIndex) {
    const filters = getFilters(table);
    delete filters[colIndex];

    table.querySelectorAll("thead .excel-header-btn")[colIndex].classList.remove("filtered");
    refreshTableVisibility(table);
}

function refreshTableFilters(table) {
    refreshTableVisibility(table);
}

function matchFilter(rawValue, filter) {
    if (!filter) return true;

    if (filter.type === "text") {
        const value = rawValue.toLowerCase();
        const target = filter.value.toLowerCase();

        if (!target) return true;

        switch (filter.operator) {
            case "contains": return value.includes(target);
            case "not_contains": return !value.includes(target);
            case "equals": return value === target;
            case "not_equals": return value !== target;
            case "starts_with": return value.startsWith(target);
            case "ends_with": return value.endsWith(target);
            default: return true;
        }
    }

    if (filter.type === "number") {
        const value = parseFloat(rawValue.replace(",", "."));
        const v1 = parseFloat(filter.value1);
        const v2 = parseFloat(filter.value2);

        if (Number.isNaN(value)) return false;

        switch (filter.operator) {
            case "eq": return value === v1;
            case "neq": return value !== v1;
            case "gt": return value > v1;
            case "gte": return value >= v1;
            case "lt": return value < v1;
            case "lte": return value <= v1;
            case "between": return value >= v1 && value <= v2;
            default: return true;
        }
    }

    if (filter.type === "date") {
        const value = new Date(rawValue);
        const d1 = new Date(filter.value1);
        const d2 = new Date(filter.value2);

        if (Number.isNaN(value.getTime())) return false;

        switch (filter.operator) {
            case "on": return value.toDateString() === d1.toDateString();
            case "before": return value < d1;
            case "after": return value > d1;
            case "between": return value >= d1 && value <= d2;
            default: return true;
        }
    }

    return true;
}

function sortTable(table, colIndex, type, asc = true) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
        let aValue = a.children[colIndex]?.textContent.trim() || "";
        let bValue = b.children[colIndex]?.textContent.trim() || "";

        if (type === "number") {
            aValue = parseFloat(aValue.replace(",", "."));
            bValue = parseFloat(bValue.replace(",", "."));
        } else if (type === "date") {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return asc ? -1 : 1;
        if (aValue > bValue) return asc ? 1 : -1;
        return 0;
    });

    rows.forEach(row => tbody.appendChild(row));
    refreshTableVisibility(table);
}

document.addEventListener("input", function (event) {
    const input = event.target.closest(".table-search-input");
    if (!input) return;

    const tableId = input.dataset.tableId;
    const table = document.getElementById(tableId);
    if (!table) return;

    table._searchValue = input.value.trim().toLowerCase();
    refreshTableVisibility(table);
});

function refreshTableVisibility(table) {
    const searchValue = table._searchValue || "";
    const filters = table._filters || {};
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const matchesSearch = !searchValue || rowText.includes(searchValue);

        let matchesFilters = true;

        Object.entries(filters).forEach(([colIndex, filter]) => {
            const cell = row.children[Number(colIndex)];
            const rawValue = cell ? cell.textContent.trim() : "";

            if (!matchFilter(rawValue, filter)) {
                matchesFilters = false;
            }
        });

        row.style.display = matchesSearch && matchesFilters ? "" : "none";
    });
}

document.addEventListener("click", function (event) {
    const btn = event.target.closest(".export-csv-btn");
    if (!btn) return;

    const table = document.getElementById(btn.dataset.tableId);
    if (!table) return;

    exportTableToCSV(table, "export.csv");
});

function exportTableToCSV(table, filename) {
    const rows = table.querySelectorAll("tr");
    const csv = [];

    rows.forEach(row => {
        if (row.style.display === "none") return;

        const cols = row.querySelectorAll("th, td");
        const rowData = [];

        cols.forEach(col => {
            let text = col.innerText.replace(/"/g, '""');
            rowData.push(`"${text}"`);
        });

        csv.push(rowData.join(","));
    });

    const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

/* =========================
   GRAPHIQUES
========================= */

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".chart-data").forEach(initChartWidget);
});

function initChartWidget(configElement) {
    const chartId = configElement.dataset.chartId;
    const chartType = normalizeChartType(configElement.dataset.chartType || "line");
    const columns = JSON.parse(configElement.dataset.columns || "[]");
    const rows = JSON.parse(configElement.dataset.rows || "[]");

    const canvas = document.getElementById(chartId);
    if (!canvas || !rows.length || columns.length < 2) return;

    const chartData = buildChartData(rows, columns);

    const chart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: usesScales(chartType)
                ? {
                    y: {
                        beginAtZero: true
                    }
                }
                : {}
        }
    });

    canvas._chartInstance = chart;
    canvas._chartRows = rows;
    canvas._chartColumns = columns;
}

document.addEventListener("input", function (event) {
    const input = event.target.closest(".chart-search-input");
    if (!input) return;

    const widgetCard = input.closest(".widget-card");
    if (!widgetCard) return;

    const configElement = widgetCard.querySelector(".chart-data");
    if (!configElement) return;

    const chartId = configElement.dataset.chartId;
    const canvas = document.getElementById(chartId);

    if (!canvas || !canvas._chartInstance) {
        console.warn("Graphique non initialisé :", chartId);
        return;
    }

    const searchValue = input.value.trim().toLowerCase();

    const rows = canvas._chartRows || [];
    const columns = canvas._chartColumns || [];

    const filteredRows = !searchValue
        ? rows
        : rows.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchValue)
            )
        );

    const newData = buildChartData(filteredRows, columns);

    canvas._chartInstance.data.labels = newData.labels;
    canvas._chartInstance.data.datasets = newData.datasets;
    canvas._chartInstance.update("active");
});

function buildChartData(rows, columns) {
    const labelColumn = columns[0];

    const numericColumns = columns
        .slice(1)
        .filter(col => rows.some(row => !Number.isNaN(Number(row[col]))));

    const textColumns = columns
        .slice(1)
        .filter(col => !numericColumns.includes(col));

    let labels = [];
    let datasets = [];

    if (numericColumns.length === 1 && textColumns.length >= 1) {
        const valueColumn = numericColumns[0];
        const groupColumn = textColumns[0];

        labels = [...new Set(rows.map(row => row[labelColumn]))];
        const groups = [...new Set(rows.map(row => row[groupColumn]))];

        datasets = groups.map(group => ({
            label: group,
            data: labels.map(label => {
                const matchingRows = rows.filter(row =>
                    String(row[labelColumn]) === String(label) &&
                    String(row[groupColumn]) === String(group)
                );

                return matchingRows.reduce((sum, row) => {
                    return sum + Number(row[valueColumn] || 0);
                }, 0);
            }),
            borderWidth: 2,
            tension: 0.35
        }));
    } else {
        labels = rows.map(row => row[labelColumn]);

        datasets = numericColumns.map(column => ({
            label: column,
            data: rows.map(row => Number(row[column] || 0)),
            borderWidth: 2,
            tension: 0.35
        }));
    }

    return { labels, datasets };
}

function normalizeChartType(type) {
    const allowed = ["bar", "line", "radar", "pie", "doughnut", "polarArea"];
    return allowed.includes(type) ? type : "line";
}

function usesScales(type) {
    return ["bar", "line"].includes(type);
}