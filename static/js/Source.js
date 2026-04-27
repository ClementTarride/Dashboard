document.addEventListener('DOMContentLoaded', () => {
    const sourceSearch = document.getElementById('sourceSearch');
    let sourceCards = Array.from(document.querySelectorAll('.source-card'));
    const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
    const searchForm = document.querySelector('.search-bar');
    const sortSelect = document.querySelector('.sort-select');
    const sourceGrid = document.getElementById('sourceGrid');

    const addSourceBtn = document.getElementById('addSourceBtn');
    const addSourceCardBtn = document.getElementById('addSourceCardBtn');
    const openDocumentationBtn = document.getElementById('openDocumentationBtn');

    const sourceModal = document.getElementById('sourceModal');
    const documentationModal = document.getElementById('documentationModal');
    const sourceModalShell = document.getElementById('sourceModalShell');

    const closeSourceModalBtn = document.getElementById('closeSourceModal');
    const cancelSourceModalBtn = document.getElementById('cancelSourceModal');
    const closeDocumentationModalBtn = document.getElementById('closeDocumentationModal');
    const toggleDocPanelBtn = document.getElementById('toggleDocPanelBtn');
    const testConnectionBtn = document.getElementById('testConnectionBtn');

    const modalKicker = document.getElementById('modalKicker');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalStatusPill = document.getElementById('modalStatusPill');
    const modalStatusText = document.getElementById('modalStatusText');
    const submitSourceBtn = document.getElementById('submitSourceBtn');

    const sourceNameInput = document.getElementById('sourceNameInput');
    const sourceTypeInput = document.getElementById('sourceTypeInput');
    const sourceDescriptionInput = document.getElementById('sourceDescriptionInput');
    const sourceHostInput = document.getElementById('sourceHostInput');
    const sourcePortInput = document.getElementById('sourcePortInput');
    const sourceDatabaseInput = document.getElementById('sourceDatabaseInput');
    const sourceSchemaInput = document.getElementById('sourceSchemaInput');
    const sourceUsernameInput = document.getElementById('sourceUsernameInput');
    const sourcePasswordInput = document.getElementById('sourcePasswordInput');
    const sourceSslInput = document.getElementById('sourceSslInput');
    const sourceTimeoutInput = document.getElementById('sourceTimeoutInput');

    const previewSourceName = document.getElementById('previewSourceName');
    const previewList = document.getElementById('previewList');

    const docPanelTitle = document.getElementById('docPanelTitle');
    const docPanelSummary = document.getElementById('docPanelSummary');
    const docPanelList = document.getElementById('docPanelList');

    const documentationModalTitle = document.getElementById('documentationModalTitle');
    const documentationModalSubtitle = document.getElementById('documentationModalSubtitle');
    const documentationCardTitle = document.getElementById('documentationCardTitle');
    const documentationCardSummary = document.getElementById('documentationCardSummary');
    const documentationChecklist = document.getElementById('documentationChecklist');

    const sourceForm = document.getElementById('sourceForm');

    let activeFilter = 'all';
    let isDocPanelVisible = false;

    function safeJsonParse(value, fallback) {
        try {
            return JSON.parse(value || '[]');
        } catch (error) {
            return fallback;
        }
    }

    function getDefaultData() {
        return {
            name: 'Nouvelle source',
            type: 'postgresql',
            engineLabel: 'PostgreSQL',
            environment: 'Nouveau',
            description: '',
            host: '',
            port: '5432',
            database: '',
            schema: 'public',
            username: '',
            ssl: 'required',
            timeout: '15',
            lastTest: 'Non testé',
            status: 'draft',
            statusLabel: 'Nouveau',
            docTitle: 'Guide de création d’une source',
            docSummary:
                'Renseignez les paramètres réseau et les accès pour connecter une base de données à la plateforme.',
            docPoints: [
                'Choisir le moteur compatible avec votre infrastructure.',
                'Compléter host, port, base, schéma et utilisateur.',
                'Lancer un test de connexion avant l’enregistrement.'
            ]
        };
    }

    function getCardData(card) {
        if (!card) return getDefaultData();

        return {
            name: card.dataset.name || 'Nouvelle source',
            type: card.dataset.type || 'postgresql',
            engineLabel: card.dataset.engineLabel || 'PostgreSQL',
            environment: card.dataset.environment || 'Environnement',
            description: card.dataset.description || '',
            host: card.dataset.host || '',
            port: card.dataset.port || '5432',
            database: card.dataset.database || '',
            schema: card.dataset.schema || 'public',
            username: card.dataset.username || '',
            ssl: card.dataset.ssl || 'required',
            timeout: card.dataset.timeout || '15',
            lastTest: card.dataset.lastTest || 'Jamais testé',
            status: card.dataset.status || 'active',
            statusLabel: card.dataset.statusLabel || 'Active',
            docTitle: card.dataset.docTitle || 'Documentation de la source',
            docSummary:
                card.dataset.docSummary ||
                'Renseignez les paramètres techniques nécessaires à la connexion.',
            docPoints: safeJsonParse(card.dataset.docPoints, [
                'Vérifier l’accès réseau à la base.',
                'Utiliser un compte dédié à la lecture.',
                'Tester la connexion avant validation.'
            ])
        };
    }

    function lockBody() {
        document.body.classList.add('modal-open');
    }

    function unlockBodyIfNeeded() {
        const sourceOpen = sourceModal && sourceModal.classList.contains('active');
        const docOpen = documentationModal && documentationModal.classList.contains('active');

        if (!sourceOpen && !docOpen) {
            document.body.classList.remove('modal-open');
        }
    }

    function updateSourceVisibility() {
        const query = sourceSearch ? sourceSearch.value.toLowerCase().trim() : '';

        sourceCards.forEach((card) => {
            if (card.classList.contains('add-source-card')) {
                card.classList.remove('hidden-card');
                return;
            }
            
            const name = (card.dataset.name || '').toLowerCase();
            const type = (card.dataset.type || '').toLowerCase();
            const status = (card.dataset.status || '').toLowerCase();
            const content = (card.textContent || '').toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                type.includes(query) ||
                status.includes(query) ||
                content.includes(query);

            let matchesFilter = false;
            if (activeFilter === 'all') {
                matchesFilter = true;
            } else if (activeFilter === 'active') {
                matchesFilter = status === 'active';
            } else if (activeFilter === 'warning') {
                matchesFilter = status === 'warning';
            } else {
                matchesFilter = type === activeFilter;
            }

            card.classList.toggle('hidden-card', !(matchesSearch && matchesFilter));
        });
    }

    function sortSourceCards(sortValue) {
        if (!sourceGrid) return;

        const normalCards = sourceCards.filter(
            (card) => !card.classList.contains('add-source-card')
        );
        const addCard = sourceCards.find((card) => card.classList.contains('add-source-card'));

        normalCards.sort((a, b) => {
            const aName = (a.dataset.name || '').toLowerCase();
            const bName = (b.dataset.name || '').toLowerCase();
            const aStatus = (a.dataset.status || '').toLowerCase();
            const bStatus = (b.dataset.status || '').toLowerCase();
            const aType = (a.dataset.type || '').toLowerCase();
            const bType = (b.dataset.type || '').toLowerCase();

            switch (sortValue) {
                case 'name':
                    return aName.localeCompare(bName, 'fr');
                case 'status':
                    return aStatus.localeCompare(bStatus, 'fr');
                case 'type':
                    return aType.localeCompare(bType, 'fr');
                case 'recent':
                default:
                    return 0;
            }
        });

        normalCards.forEach((card) => sourceGrid.appendChild(card));
        if (addCard) sourceGrid.appendChild(addCard);
    }

    function setDocPanelVisibility(visible) {
        isDocPanelVisible = Boolean(visible);

        if (sourceModalShell) {
            sourceModalShell.classList.toggle('docs-hidden', !isDocPanelVisible);
        }

        if (toggleDocPanelBtn) {
            toggleDocPanelBtn.textContent = isDocPanelVisible
                ? 'Masquer la documentation'
                : 'Voir la documentation';
        }
    }

    function renderDocList(target, items) {
        if (!target) return;

        target.innerHTML = '';

        (items || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            target.appendChild(li);
        });
    }

    function createPreviewRow(label, value) {
        const row = document.createElement('div');
        row.className = 'preview-row';

        const span = document.createElement('span');
        span.textContent = label;

        const strong = document.createElement('strong');
        strong.textContent = value;

        row.appendChild(span);
        row.appendChild(strong);

        return row;
    }

    function updatePreview() {
        if (!previewSourceName || !previewList) return;

        const selectedOption =
            sourceTypeInput && sourceTypeInput.options
                ? sourceTypeInput.options[sourceTypeInput.selectedIndex]
                : null;

        const selectedText = selectedOption ? selectedOption.text : 'PostgreSQL';
        const sourceName = sourceNameInput ? sourceNameInput.value.trim() : '';
        const sourceHost = sourceHostInput ? sourceHostInput.value.trim() : '';
        const sourceDatabase = sourceDatabaseInput ? sourceDatabaseInput.value.trim() : '';
        const currentStatus = modalStatusPill ? modalStatusPill.textContent : 'À configurer';

        previewSourceName.textContent = sourceName || 'Nouvelle source';
        previewList.innerHTML = '';

        previewList.appendChild(createPreviewRow('Type', selectedText));
        previewList.appendChild(createPreviewRow('Host', sourceHost || '—'));
        previewList.appendChild(createPreviewRow('Base', sourceDatabase || '—'));
        previewList.appendChild(createPreviewRow('Statut', currentStatus || '—'));
    }

    function fillForm(data) {
        if (sourceNameInput) sourceNameInput.value = data.name || '';
        if (sourceTypeInput) sourceTypeInput.value = data.type || 'postgresql';
        if (sourceDescriptionInput) sourceDescriptionInput.value = data.description || '';
        if (sourceHostInput) sourceHostInput.value = data.host || '';
        if (sourcePortInput) sourcePortInput.value = data.port || '';
        if (sourceDatabaseInput) sourceDatabaseInput.value = data.database || '';
        if (sourceSchemaInput) sourceSchemaInput.value = data.schema || '';
        if (sourceUsernameInput) sourceUsernameInput.value = data.username || '';
        if (sourcePasswordInput) sourcePasswordInput.value = '';
        if (sourceSslInput) sourceSslInput.value = data.ssl || 'required';
        if (sourceTimeoutInput) sourceTimeoutInput.value = data.timeout || '15';
    }

    function fillDocumentation(data) {
        if (docPanelTitle) docPanelTitle.textContent = data.docTitle;
        if (docPanelSummary) docPanelSummary.textContent = data.docSummary;
        renderDocList(docPanelList, data.docPoints || []);

        if (documentationModalTitle) documentationModalTitle.textContent = data.docTitle;
        if (documentationModalSubtitle) {
            documentationModalSubtitle.textContent =
                `Documentation contextuelle pour ${data.name}. ` +
                'Cette vue reprend les mêmes conseils sans les actions de création.';
        }
        if (documentationCardTitle) documentationCardTitle.textContent = data.docTitle;
        if (documentationCardSummary) documentationCardSummary.textContent = data.docSummary;
        renderDocList(documentationChecklist, data.docPoints || []);
    }

    function openSourceModal(mode, data) {
        const isEdit = mode === 'edit';
        const sourceData = data || getDefaultData();

        if (modalKicker) modalKicker.textContent = isEdit ? 'Modification' : 'Configuration';
        if (modalTitle) {
            modalTitle.textContent = isEdit
                ? `Modifier ${sourceData.name}`
                : 'Ajouter une source';
        }

        if (modalSubtitle) {
            modalSubtitle.textContent = isEdit
                ? 'Mettez à jour les paramètres techniques de cette connexion et validez les changements.'
                : 'Configurez la connexion à votre base de données et testez les paramètres avant validation.';
        }

        if (modalStatusPill) modalStatusPill.textContent = isEdit ? sourceData.statusLabel : 'Nouveau';

        if (modalStatusText) {
            modalStatusText.textContent = isEdit
                ? `Dernier test : ${sourceData.lastTest}`
                : 'Prêt à configurer';
        }

        if (submitSourceBtn) {
            submitSourceBtn.textContent = isEdit
                ? 'Enregistrer les modifications'
                : 'Enregistrer la source';
        }

        fillForm(sourceData);
        fillDocumentation(sourceData);
        setDocPanelVisibility(false);
        updatePreview();

        if (sourceModal) {
            sourceModal.classList.add('active');
            sourceModal.setAttribute('aria-hidden', 'false');
            lockBody();
        }
    }

    function closeSourceModal() {
        if (!sourceModal) return;

        sourceModal.classList.remove('active');
        sourceModal.setAttribute('aria-hidden', 'true');
        setDocPanelVisibility(false);
        unlockBodyIfNeeded();
    }

    function openDocumentationModal(data) {
        fillDocumentation(data || getDefaultData());

        if (documentationModal) {
            documentationModal.classList.add('active');
            documentationModal.setAttribute('aria-hidden', 'false');
            lockBody();
        }
    }

    function closeDocumentationModal() {
        if (!documentationModal) return;

        documentationModal.classList.remove('active');
        documentationModal.setAttribute('aria-hidden', 'true');
        unlockBodyIfNeeded();
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            updateSourceVisibility();
        });
    }

    if (sourceSearch) {
        sourceSearch.addEventListener('input', updateSourceVisibility);
    }

    filterChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            filterChips.forEach((btn) => btn.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.dataset.filter || 'all';
            updateSourceVisibility();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortSourceCards(sortSelect.value);
            updateSourceVisibility();
        });
    }

    sourceCards.forEach((card) => {
        if (card.classList.contains('add-source-card')) return;

        const testBtn = card.querySelector('.test-source-btn');
        const editBtn = card.querySelector('.edit-source-btn');
        const docBtn = card.querySelector('.view-doc-btn');
        const deleteBtn = card.querySelector('.danger-link');
        if (testBtn) {
            testBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
        if (editBtn) {
            editBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openSourceModal('edit', getCardData(card));
            });
        }

        if (docBtn) {
            docBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openDocumentationModal(getCardData(card));
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (event) => {
                const sourceName = card.dataset.name || 'cette source';

                const confirmed = window.confirm(`Supprimer ${sourceName} ?`);

                if (!confirmed) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }
    });

    if (addSourceBtn) {
        addSourceBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openSourceModal('create', getDefaultData());
        });
    }

    if (addSourceCardBtn) {
        addSourceCardBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openSourceModal('create', getDefaultData());
        });
    }

    if (openDocumentationBtn) {
        openDocumentationBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openDocumentationModal(getDefaultData());
        });
    }

    if (closeSourceModalBtn) {
        closeSourceModalBtn.addEventListener('click', closeSourceModal);
    }

    if (cancelSourceModalBtn) {
        cancelSourceModalBtn.addEventListener('click', closeSourceModal);
    }

    if (closeDocumentationModalBtn) {
        closeDocumentationModalBtn.addEventListener('click', closeDocumentationModal);
    }

    if (toggleDocPanelBtn) {
        toggleDocPanelBtn.addEventListener('click', () => {
            setDocPanelVisibility(!isDocPanelVisible);
        });
    }

    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', () => {
            if (modalStatusPill) modalStatusPill.textContent = 'Test simulé';
            if (modalStatusText) modalStatusText.textContent = 'Connexion valide - configuration prête';
            updatePreview();
        });
    }

    [
        sourceNameInput,
        sourceTypeInput,
        sourceHostInput,
        sourceDatabaseInput,
        sourcePortInput,
        sourceSchemaInput,
        sourceUsernameInput,
        sourceTimeoutInput,
        sourceSslInput,
        sourceDescriptionInput
    ].forEach((field) => {
        if (!field) return;
        field.addEventListener('input', updatePreview);
        field.addEventListener('change', updatePreview);
    });

    if (sourceForm) {
        sourceForm.addEventListener('submit', () => {
            if (modalStatusPill) modalStatusPill.textContent = 'Sauvegarde...';
            if (modalStatusText) modalStatusText.textContent = 'Enregistrement en cours';
        });
    }

    [sourceModal, documentationModal].forEach((modal) => {
        if (!modal) return;

        modal.addEventListener('click', (event) => {
            if (event.target !== modal) return;

            if (modal === sourceModal) {
                closeSourceModal();
            } else {
                closeDocumentationModal();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        if (documentationModal && documentationModal.classList.contains('active')) {
            closeDocumentationModal();
            return;
        }

        if (sourceModal && sourceModal.classList.contains('active')) {
            closeSourceModal();
        }
    });

    updateSourceVisibility();
    updatePreview();
});