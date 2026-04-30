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
const userModal = document.getElementById('userModal');

function openUserModal() {
    userModal.classList.add('open');
}

function closeUserModal() {
    userModal.classList.remove('open');
}

document.querySelector('[data-open-user-modal]')?.addEventListener('click', () => {
    document.getElementById('userModalTitle').textContent = 'Inviter un utilisateur';
    document.getElementById('user_id').value = '';
    document.getElementById('full_name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('status').value = 'active';
    document.getElementById('avatar_url').value = '';

    openUserModal();
});

document.querySelectorAll('[data-close-user-modal]').forEach((btn) => {
    btn.addEventListener('click', closeUserModal);
});

document.querySelectorAll('[data-edit-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.getElementById('userModalTitle').textContent = 'Modifier un utilisateur';
        document.getElementById('user_id').value = btn.dataset.id;
        document.getElementById('full_name').value = btn.dataset.name;
        document.getElementById('email').value = btn.dataset.email;
        document.getElementById('password').value = '';
        document.getElementById('status').value = btn.dataset.status;
        document.getElementById('avatar_url').value = btn.dataset.avatar;

        openUserModal();
    });
});