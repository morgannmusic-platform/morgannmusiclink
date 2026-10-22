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

        import("/assets/js/site-search.js")
            .then((module) => {
                module.initGlobalSiteFeatures();
            })
            .catch((err) => {
                console.error("Erreur de chargement de site-search.js:", err);
            });
    });