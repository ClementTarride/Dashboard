const authContainer = document.getElementById("authContainer");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");
const overlayTitle = document.getElementById("overlayTitle");
const overlayDescription = document.getElementById("overlayDescription");

showRegisterBtn.addEventListener("click", () => {
    authContainer.classList.add("active");
    overlayTitle.textContent = "Créer un compte";
    overlayDescription.textContent =
        "Inscris-toi pour commencer l'aventure et accéder à toutes les fonctionnalités.";
});

showLoginBtn.addEventListener("click", () => {
    authContainer.classList.remove("active");
    overlayTitle.textContent = "Bienvenue";
    overlayDescription.textContent =
        "Connecte-toi pour accéder à ton espace personnel.";
});