document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('[data-admin-search]');
    const searchableCards = document.querySelectorAll('[data-search-card]');
    const searchableRows = document.querySelectorAll('[data-search-row]');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const value = searchInput.value.toLowerCase().trim();

            searchableCards.forEach((card) => {
                const name = (card.dataset.searchCard || card.textContent).toLowerCase();
                card.classList.toggle('hidden-card', value && !name.includes(value));
            });

            searchableRows.forEach((row) => {
                const name = (row.dataset.searchRow || row.textContent).toLowerCase();
                row.classList.toggle('hidden-row', value && !name.includes(value));
            });
        });
    }

    document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            const group = chip.closest('.filters-left');
            if (!group) return;
            group.querySelectorAll('.filter-chip').forEach((item) => item.classList.remove('active'));
            chip.classList.add('active');
        });
    });
});
