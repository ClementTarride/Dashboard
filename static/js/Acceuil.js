function initCarousel(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const container = track.closest(".carousel-card");
    const leftBtn = container.querySelector(".arrow-btn.left");
    const rightBtn = container.querySelector(".arrow-btn.right");
    const sliderWindow = container.querySelector(".slider-window");

    let currentIndex = 0;

    function getStepSize() {
        const firstCard = track.querySelector(".item-card");
        if (!firstCard) return 0;

        const gap = parseInt(window.getComputedStyle(track).gap) || 0;
        return firstCard.offsetWidth + gap;
    }

    function getVisibleCount() {
        const step = getStepSize();
        if (!step) return 1;
        return Math.max(1, Math.floor(sliderWindow.offsetWidth / step));
    }

    function getMaxIndex() {
        const totalCards = track.querySelectorAll(".item-card").length;
        return Math.max(0, totalCards - getVisibleCount());
    }

    function updateCarousel() {
        const step = getStepSize();
        track.style.transform = `translateX(-${currentIndex * step}px)`;

        leftBtn.disabled = currentIndex <= 0;
        rightBtn.disabled = currentIndex >= getMaxIndex();
    }

    leftBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex -= 1;
            updateCarousel();
        }
    });

    rightBtn.addEventListener("click", () => {
        if (currentIndex < getMaxIndex()) {
            currentIndex += 1;
            updateCarousel();
        }
    });

    window.addEventListener("resize", () => {
        currentIndex = Math.min(currentIndex, getMaxIndex());
        updateCarousel();
    });

    updateCarousel();
}

initCarousel("models-track");
initCarousel("sources-track");
initCarousel("dashboards-track");
initCarousel("tables-track");