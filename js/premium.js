// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIRE & EMBER BACKGROUND SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFireCanvas() {
    const canvas = document.getElementById('fire-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const embers = [];
    // Increased particle count by roughly 30% for denser glowing elements
    const MAX_EMBERS = window.innerWidth < 768 ? 30 : 80;

    function spawnEmber() {
        return {
            x: Math.random() * width,
            y: height + Math.random() * 20,
            size: 1.5 + Math.random() * 2.5,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.4 - Math.random() * 0.8, // Slightly faster upward velocity
            life: 1.3, // Extended life so they survive longer / go higher
            fade: 0.002 + Math.random() * 0.002, // Slower fade out
            hueOffset: Math.random() * 20 
        };
    }

    // Initialize array
    for (let i = 0; i < MAX_EMBERS; i++) {
        embers.push(spawnEmber());
        // Scatter initially so they aren't all at the bottom
        embers[i].y = Math.random() * height;
    }

    function renderEmbers() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = embers.length - 1; i >= 0; i--) {
            const e = embers[i];
            e.x += e.vx;
            e.y += e.vy;
            e.life -= e.fade;

            // Allow elements to float 30% higher before despawning (originally -10)
            if (e.life <= 0 || e.y < -(height * 0.3)) {
                embers[i] = spawnEmber();
                continue;
            }

            // Determine color based on life
            let hue, sat, light, alpha;
            if (e.life > 0.7) {
                // Bright white-gold dot
                hue = 45 + e.hueOffset; sat = 100; light = 85; alpha = e.life;
            } else if (e.life > 0.3) {
                // Amber
                hue = 30 + e.hueOffset; sat = 90; light = 60; alpha = e.life;
            } else {
                // Dark red dying
                hue = 15; sat = 100; light = 45; alpha = e.life * 1.5;
            }

            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
            
            // Add subtle glow if bright
            if (e.life > 0.5) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${alpha})`;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fill();
        }
        requestAnimationFrame(renderEmbers);
    }
    renderEmbers();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM CURSOR & MAGNETIC BUTTONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCursor() {
    if (window.innerWidth < 768) return; // Disable on mobile

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    function animateRing() {
        ringX = lerp(ringX, mouseX, 0.15);
        ringY = lerp(ringY, mouseY, 0.15);
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .vibe-card, .dresscode-card, .cd-box, .host-item');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Magnetic buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const distance = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
            
            if (distance < 80) {
                const dx = (e.clientX - cx) * 0.25;
                const dy = (e.clientY - cy) * 0.25;
                btn.style.transform = `translate(${dx}px, ${dy}px)`;
            } else {
                btn.style.transform = `translate(0px, 0px)`;
            }
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3D CARD TILT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCardTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        const handleMove = (clientX, clientY) => {
            const rect = card.getBoundingClientRect();
            const relX = (clientX - rect.left) / rect.width - 0.5;
            const relY = (clientY - rect.top) / rect.height - 0.5;
            // Max rotate: +/- 8 deg
            card.style.transform = `perspective(1000px) rotateX(${relY * -16}deg) rotateY(${relX * 16}deg) scale(1.02)`;
        };

        const handleReset = () => {
            card.style.transition = 'transform 0.4s ease'; // Ensure smooth snap back
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            setTimeout(() => { card.style.transition = ''; }, 400);
        };

        // Desktop
        card.addEventListener('mousemove', e => {
            if (window.innerWidth < 768) return;
            handleMove(e.clientX, e.clientY);
        });
        card.addEventListener('mouseleave', () => {
            if (window.innerWidth < 768) return;
            handleReset();
        });

        // Mobile Touch Interaction
        card.addEventListener('touchmove', e => {
            if (window.innerWidth >= 768) return;
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            if (window.innerWidth >= 768) return;
            handleReset();
        });
        card.addEventListener('touchcancel', () => {
            if (window.innerWidth >= 768) return;
            handleReset();
        });
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADING TEXT SPLIT REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initTextSplit() {
    const headings = document.querySelectorAll('.section-heading, .opening-title, .rsvp-big-title');
    headings.forEach(h => {
        if (!h.innerHTML.includes('<br')) {
            // Simple split if no br
            const text = h.textContent;
            h.innerHTML = '';
            for (let i = 0; i < text.length; i++) {
                if (text[i] === ' ') {
                    h.innerHTML += ' ';
                    continue;
                }
                const span = document.createElement('span');
                span.className = 'char-span';
                span.style.animationDelay = `${i * 25}ms`;
                span.textContent = text[i];
                h.appendChild(span);
            }
        } else {
            // Handle BRs
            const parts = h.innerHTML.split(/<br\s*\/?>/i);
            h.innerHTML = '';
            let charIndex = 0;
            parts.forEach((part, lineIdx) => {
                // Strip HTML from part if there was any (there usually isn't except text)
                const text = part.trim();
                for (let i = 0; i < text.length; i++) {
                    if (text[i] === ' ') {
                        h.innerHTML += ' ';
                        continue;
                    }
                    const span = document.createElement('span');
                    span.className = 'char-span';
                    span.style.animationDelay = `${charIndex * 25}ms`;
                    span.textContent = text[i];
                    h.appendChild(span);
                    charIndex++;
                }
                if (lineIdx < parts.length - 1) h.appendChild(document.createElement('br'));
            });
        }
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING NAV INTERSECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFloatingNav() {
    const nav = document.getElementById('top-nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Watch gate opening to show nav
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('gone')) {
                nav.classList.add('visible');
                observer.disconnect();
            }
        });
    });
    const gate = document.getElementById('gate');
    if(gate) observer.observe(gate, { attributes: true, attributeFilter: ['class'] });

    // Active state tracking
    const sectionObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { threshold: 0.3 });
    
    sections.forEach(sec => sectionObs.observe(sec));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HAWAII SHOWCASE INTERACTIVE FLOATER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initShowcase() {
    const floater = document.getElementById('showcase-floater');
    const hawaiiSection = document.getElementById('hawaii');
    if (!floater || !hawaiiSection) return;

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let floatsX = mouseX, floatsY = mouseY;
    let isHovering = false;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateShowcase() {
        if(isHovering) {
            floatsX += (mouseX - floatsX) * 0.15;
            floatsY += (mouseY - floatsY) * 0.15;
            // offset slightly so cursor doesn't block image
            floater.style.transform = `translate3d(${floatsX + 20}px, ${floatsY - 160}px, 0) scale(1)`;
        } else {
            // Keep tracking lightly so it pops in near cursor smoothly
            floatsX = mouseX;
            floatsY = mouseY;
            floater.style.transform = `translate3d(${floatsX + 20}px, ${floatsY - 160}px, 0) scale(0.8)`;
        }
        requestAnimationFrame(animateShowcase);
    }
    animateShowcase();

    // Attach to window so onmouseover string handlers work natively
    window.setPreview = (id) => {
        isHovering = true;
        floater.style.opacity = '1';
        
        for(let i=1; i<=4; i++) {
            const img = document.getElementById(`sc-img-${i}`);
            if(img) img.style.opacity = '0';
        }
        const target = document.getElementById(`sc-img-${id}`);
        if(target) target.style.opacity = '1';
    };

    window.clearPreview = () => {
        isHovering = false;
        floater.style.opacity = '0';
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOTSTRAP PREMIUM ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.addEventListener('DOMContentLoaded', () => {
    initFireCanvas();
    initCursor();
    initTextSplit();
    initFloatingNav();
    initShowcase();
    // delay tilt binding slightly
    setTimeout(initCardTilt, 500);
});
