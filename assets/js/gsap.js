
        // Inscription des plugins GSAP
        document.addEventListener("DOMContentLoaded", (event) => {
            gsap.registerPlugin(ScrollTrigger, SplitText);

            // --- 1. Animation des Liens des Plateformes (Montée séquentielle au scroll) ---
            gsap.from("#image-container a", {
                opacity: 0,
                y: 100,
                duration: 3,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#image-container",
                    start: "top 80%",
                    end: "bottom center",
                    scrub: 1,
                },
            });


            // --- 2. Animation d'apparition du Texte Principal (Au chargement) ---
            gsap.from(".text-hover", {
                y: -50,
                opacity: 0,
                duration: 1.5,
                delay: 0.5,
                ease: "power3.out",
            });

            // --- 3. Animation du Titre Morgann Music Send (SplitText par mot) ---
            const heroTextSplit = new SplitText("#morgann-text", {
                type: "words"
            });

            gsap.from(heroTextSplit.words, {
                y: 50,
                opacity: 0,
                rotationX: -90,
                stagger: 0.1,
                duration: 1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: "#morgann-text",
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });

            // --- 4. Animation de la Barre de Séparation (Progression au scroll) ---
            gsap.utils.toArray(".simple-separator").forEach(separator => {
                gsap.from(separator, {
                    scaleX: 0,
                    transformOrigin: "center right",
                    duration: 1.5,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: separator,
                        start: "top 95%",
                        end: "bottom 50%",
                        scrub: 0.5,
                        toggleActions: "play none none reverse",
                    }
                });
            });
        });