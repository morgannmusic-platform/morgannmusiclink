
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Script pour le menu hamburger
        const menuToggle = document.getElementById('menu-toggle');
        const navLinks = document.getElementById('nav-links');

        // Nous utilisons un seul écouteur d'événement pour le basculement
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });


        // ANIMATION DES LETTRES
        document.querySelectorAll('.letter').forEach(letter => {
            letter.addEventListener('mouseenter', function() {
                if (!this.classList.contains('animate')) {
                    this.classList.add('animate');
                    setTimeout(() => {
                        this.classList.remove('animate');
                    }, 600);
                }
            });
        });
    

    
        // 1. Utilisation de querySelector pour cibler les classes CSS
        const animationZone = document.querySelector('.hero-text');
        const animatedText = document.querySelector('.morgann-music');

        // Vérifie si les éléments existent avant de continuer
        if (animationZone && animatedText) {

            // Récupération des couleurs CSS une seule fois
            const colorStart = getComputedStyle(document.documentElement).getPropertyValue('--light-color-start').trim();
            const colorEnd = getComputedStyle(document.documentElement).getPropertyValue('--light-color-end').trim();

            // Événement au mouvement de la souris
            animationZone.addEventListener('mousemove', (e) => {
                const rect = animationZone.getBoundingClientRect();

                // Calcule la position X relative dans le conteneur
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;

                // Met à jour le dégradé (avec la "fenêtre" de lumière de 40%)
                animatedText.style.background = `linear-gradient(90deg, ${colorStart} ${percentage - 20}%, ${colorEnd} ${percentage + 20}%)`;

                // Sécurité : Maintenir le clip textuel (même si le CSS devrait le faire)
                animatedText.style.webkitBackgroundClip = 'text';
                animatedText.style.webkitTextFillColor = 'transparent';
            });

            // Événement lorsque la souris quitte la zone (CORRECTION DU BUG)
            animationZone.addEventListener('mouseleave', () => {
                // 1. Réinitialiser la couleur/dégradé à la valeur statique (0% et 100%)
                animatedText.style.background = `linear-gradient(90deg, ${colorStart} 0%, ${colorEnd} 100%)`;

                // 2. Réaffirmer les propriétés de clip textuel
                animatedText.style.webkitBackgroundClip = 'text';
                animatedText.style.webkitTextFillColor = 'transparent';

                // 3. (Facultatif) Annuler la transformation de mise à l'échelle si elle était appliquée via JS
                // Note: Vous gérez déjà le scale via :hover en CSS, donc cette ligne est facultative/inutile
                // si vous vous en tenez à la solution CSS.
                // animatedText.style.transform = 'scale(1)'; 
            });

        } else {
            console.error("Erreur: Les éléments .hero-text ou .morgann-music n'ont pas été trouvés dans le DOM.");
        }
    

        document.addEventListener('DOMContentLoaded', function() {
            const infoBouton = document.querySelector('.info-bouton');

            infoBouton.addEventListener('click', function() {
                // Inverse la classe 'ouvert' : si elle est là, il l'enlève ; sinon, il l'ajoute.
                infoBouton.classList.toggle('ouvert');
            });
        });

    
        document.addEventListener('DOMContentLoaded', () => {
            // 1. Sélectionner tous les éléments à animer
            const elementsToAnimate = document.querySelectorAll('.titre-page');

            // 2. Définir les options de l'observateur
            const observerOptions = {
                root: null, // Par défaut, la fenêtre d'affichage (viewport)
                rootMargin: '0px', // Marge autour du viewport
                threshold: 0.1 // Déclencheur : 10% de l'élément doit être visible
            };

            // 3. La fonction à exécuter lorsque l'élément est vu (ou n'est plus vu)
            const observerCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // L'élément est dans le viewport : on ajoute la classe 'visible'
                        entry.target.classList.add('visible');

                        // Optionnel : on arrête de l'observer pour ne pas redéclencher l'animation
                        observer.unobserve(entry.target);
                    } else {
                        entry.target.classList.remove('visible');
                    }
                    // else {
                    //   Si on voulait que l'animation se répète en sortant/rentrant, on ajouterait ici entry.target.classList.remove('visible');
                    // }
                });
            };

            // 4. Créer l'observateur
            const observer = new IntersectionObserver(observerCallback, observerOptions);

            // 5. Attacher l'observateur à chaque élément
            elementsToAnimate.forEach(element => {
                observer.observe(element);
            });
        });

    
        function lancerConfettis(nb = 300) {
            const canvas = document.getElementById('confetti-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const confettis = [];
            const groundY = canvas.height;

            for (let i = 0; i < nb; i++) {
                confettis.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * -canvas.height,
                    r: Math.random() * 6 + 4,
                    d: Math.random() * nb,
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    tilt: Math.random() * 10 - 10,
                    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                    tiltAngle: 0,
                    speed: Math.random() * 2 + 2,
                    landed: false
                });
            }

            let fadeOutStarted = false;
            let textOpacity = 1;

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                confettis.forEach(c => {
                    ctx.beginPath();
                    ctx.lineWidth = c.r / 2;
                    ctx.strokeStyle = c.color;
                    ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
                    ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
                    ctx.stroke();
                });

                update();
            }

            function update() {
                let allLanded = true;
                confettis.forEach(c => {
                    if (!c.landed) {
                        c.tiltAngle += c.tiltAngleIncremental;
                        c.y += c.speed;
                        c.tilt = Math.sin(c.tiltAngle) * 15;
                        if (c.y >= groundY - c.r) {
                            c.y = groundY - c.r;
                            c.speed = 0;
                            c.landed = true;
                        } else {
                            allLanded = false;
                        }
                    }
                });

                if (allLanded && !fadeOutStarted) {
                    fadeOutConfettis();
                }
            }

            const interval = setInterval(draw, 20);

            // Après 3 secondes : enlever le blur et fade le texte
            setTimeout(() => {
                const overlay = document.getElementById('newyear-overlay');
                if (overlay) overlay.style.backdropFilter = "blur(0px)";
                document.body.classList.remove('no-scroll');

                const fadeText = setInterval(() => {
                    textOpacity -= 0.02;
                    const textDiv = document.querySelector('.newyear-text');
                    if (textDiv) textDiv.style.opacity = textOpacity;
                    if (textOpacity <= 0) clearInterval(fadeText);
                }, 20);

            }, 3000);

            // CROIX DE FERMETURE
            const closeBtn = document.getElementById('close-overlay');
            closeBtn.addEventListener('click', () => {
                clearInterval(interval);
                const overlay = document.getElementById('newyear-overlay');
                if (overlay) overlay.remove();
                document.body.classList.remove('no-scroll');
            });

            function fadeOutConfettis() {
                fadeOutStarted = true;
                let alpha = 1;
                const fadeInterval = setInterval(() => {
                    alpha -= 0.02;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = alpha;
                    confettis.forEach(c => {
                        ctx.beginPath();
                        ctx.lineWidth = c.r / 2;
                        ctx.strokeStyle = c.color;
                        ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
                        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
                        ctx.stroke();
                    });
                    ctx.globalAlpha = 1;
                    if (alpha <= 0) {
                        clearInterval(fadeInterval);
                        clearInterval(interval);
                        const overlay = document.getElementById('newyear-overlay');
                        if (overlay) overlay.remove();
                    }
                }, 20);
            }
        }

        window.addEventListener('load', () => {
            document.body.classList.add('no-scroll'); // bloque le scroll pendant l'animation
            lancerConfettis(300);
        });
