const searchInput = document.getElementById("dashboardSearch");
const dashboardGrid = document.getElementById("dashboardGrid");
const filterChips = document.querySelectorAll(".filter-chip");
const sortSelect = document.getElementById("dashboardSort");

function getCards() {
    return Array.from(document.querySelectorAll(".dashboard-card:not(.add-dashboard-card)"));
}

function applyFilters() {
    const query = searchInput?.value.toLowerCase().trim() || "";
    const activeFilter = document.querySelector(".filter-chip.active")?.dataset.filter || "Tous";

    getCards().forEach((card) => {
        const name = card.dataset.name.toLowerCase();
        const category = card.dataset.category || "";
        const content = card.textContent.toLowerCase();

        const matchesSearch = name.includes(query) || content.includes(query);
        const matchesFilter = activeFilter === "Tous" || category === activeFilter;

        card.classList.toggle("hidden-card", !(matchesSearch && matchesFilter));
    });
}

searchInput?.addEventListener("input", applyFilters);

filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        filterChips.forEach((btn) => btn.classList.remove("active"));
        chip.classList.add("active");
        applyFilters();
    });
});


