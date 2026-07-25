fetch("/navbar.html")
    .then((response) => response.text())
    .then((data) => {
        const navbarContainer = document.getElementById("navbar-container");
        if (!navbarContainer) return;

        navbarContainer.innerHTML = data;
        document.body.classList.add("has-global-navbar");

        const navbar = document.getElementById("navbar");
        if (navbar) {
            window.addEventListener("scroll", () => {
                if (window.scrollY > 50) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
            });
        }

        const menuToggle = document.getElementById("menu-toggle");
        const navLinks = document.getElementById("nav-links");

        if (menuToggle && navLinks) {
            menuToggle.addEventListener("click", () => {
                navLinks.classList.toggle("active");
            });
        }

        // CORRECTION ICI : Remplace le chemin par le bon emplacement de site-search.js
        // Si site-search.js est dans le même dossier que navbar.js :
        import("/assets/js/site-search.js")
            .then((module) => {
                module.initGlobalSiteFeatures();
            })
            .catch((err) => {
                console.error("Erreur de chargement de site-search.js:", err);
            });

        // Si firebase-app.js est aussi dans le même dossier :
        import("./firebase-app.js")
            .then(async (module) => {
                const authActions = document.getElementById("auth-actions");
                const profileNav = document.getElementById("profile-nav");
                const profileToggle = document.getElementById("profile-toggle");
                const profileMenu = document.getElementById("profile-menu");
                const logoutBtn = document.getElementById("logout-btn");

                if (!authActions || !profileNav || !profileToggle || !profileMenu || !logoutBtn) return;

                const closeProfileMenu = () => {
                    profileMenu.classList.remove("open");
                    profileToggle.setAttribute("aria-expanded", "false");
                };

                profileToggle.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const isOpen = profileMenu.classList.toggle("open");
                    profileToggle.setAttribute("aria-expanded", "true" ? isOpen : "false");
                });

                document.addEventListener("click", (event) => {
                    if (!profileNav.contains(event.target)) {
                        closeProfileMenu();
                    }
                });

                logoutBtn.addEventListener("click", async () => {
                    try {
                        await module.signOut(module.auth);
                        closeProfileMenu();
                        window.location.href = "connexion.html";
                    } catch { }
                });

                module.onAuthStateChanged(module.auth, (user) => {
                    if (user) {
                        authActions.hidden = true;
                        profileNav.hidden = false;
                    } else {
                        authActions.hidden = false;
                        profileNav.hidden = true;
                        closeProfileMenu();
                    }
                });
            })
            .catch(() => { });
    });