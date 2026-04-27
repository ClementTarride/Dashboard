const searchInput = document.getElementById("dashboardSearch");
const dashboardCards = document.querySelectorAll(".dashboard-card");
const filterChips = document.querySelectorAll(".filter-chip");

if (searchInput) {
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase().trim();

        dashboardCards.forEach((card) => {
            const name = card.dataset.name.toLowerCase();
            const content = card.textContent.toLowerCase();

            const matches = name.includes(query) || content.includes(query);
            card.classList.toggle("hidden-card", !matches);
        });
    });
}

filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        filterChips.forEach((btn) => btn.classList.remove("active"));
        chip.classList.add("active");
    });
});