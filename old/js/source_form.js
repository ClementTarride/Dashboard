const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");

if (passwordInput && togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.textContent = isPassword ? "Masquer" : "Afficher";
    });
}