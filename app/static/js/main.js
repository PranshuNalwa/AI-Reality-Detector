/* ═══════════════════════════════════════════════════════════
   AI REALITY DETECTOR — Main JavaScript
   Handles: Tabs, Scroll, Particles, Dropzones, Stats Counter
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    initNavbar();
    initTabs();
    initDropzones();
    initParticles();
    initStatsCounter();
    initScrollReveal();
    initTextCounter();
    initMobileNav();
    initNavLinks();
});

/* ── Navbar Scroll Effect ──────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('main-nav');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ── Nav Link Click → Tab Activation ───────────────────── */
function initNavLinks() {
    document.querySelectorAll('[data-tab-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            const tabTarget = link.getAttribute('data-tab-target');
            const href = link.getAttribute('href');

            // Close mobile nav if open
            const overlay = document.getElementById('mobile-nav-overlay');
            const hamburger = document.getElementById('hamburger-btn');
            if (overlay && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            }

            // Activate the corresponding tab after scroll
            setTimeout(() => {
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabTarget}"]`);
                if (tabBtn) tabBtn.click();
            }, 500);
        });
    });
}

/* ── Feature Tabs ──────────────────────────────────────── */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panels
            panels.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`panel-${tab}`);
            if (target) {
                target.classList.add('active');
                // Re-initialize Lucide icons for newly visible panel
                if (window.lucide) lucide.createIcons();
            }
        });
    });
}

/* ── Dropzone Handling ─────────────────────────────────── */
function initDropzones() {
    setupDropzone({
        dropzone: 'image-dropzone',
        input: 'image-file-input',
        preview: 'image-preview',
        previewImg: 'image-preview-img',
        previewName: 'image-preview-name',
        clearBtn: 'image-preview-clear',
        submitBtn: 'image-submit-btn'
    });

    setupDropzone({
        dropzone: 'qr-dropzone',
        input: 'qr-file-input',
        preview: 'qr-preview',
        previewImg: 'qr-preview-img',
        previewName: 'qr-preview-name',
        clearBtn: 'qr-preview-clear',
        submitBtn: 'qr-submit-btn'
    });
}

function setupDropzone(cfg) {
    const dropzone = document.getElementById(cfg.dropzone);
    const input = document.getElementById(cfg.input);
    const preview = document.getElementById(cfg.preview);
    const previewImg = document.getElementById(cfg.previewImg);
    const previewName = document.getElementById(cfg.previewName);
    const clearBtn = document.getElementById(cfg.clearBtn);
    const submitBtn = document.getElementById(cfg.submitBtn);

    if (!dropzone || !input) return;

    // Drag events
    ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files.length) {
            input.files = files;
            showPreview(files[0]);
        }
    });

    // Click to trigger input
    dropzone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
            input.click();
        }
    });

    input.addEventListener('change', () => {
        if (input.files.length) showPreview(input.files[0]);
    });

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = e => {
            if (previewImg) previewImg.src = e.target.result;
            if (previewName) previewName.textContent = file.name;
            if (dropzone) dropzone.style.display = 'none';
            if (preview) preview.style.display = 'flex';
            if (submitBtn) submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            if (dropzone) dropzone.style.display = '';
            if (preview) preview.style.display = 'none';
            if (submitBtn) submitBtn.disabled = true;
        });
    }
}

/* ── Floating Particles ────────────────────────────────── */
function initParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const count = 40;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (6 + Math.random() * 8) + 's';
        p.style.width = p.style.height = (1 + Math.random() * 3) + 'px';
        container.appendChild(p);
    }
}

/* ── Stats Counter Animation ───────────────────────────── */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat__number[data-count]');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isDecimal) {
            el.textContent = current.toFixed(1);
        } else {
            el.textContent = Math.round(current).toLocaleString();
        }

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ── Scroll Reveal ─────────────────────────────────────── */
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.section-header, .step-card, .pricing-card, .panel-card, .stats-bar'
    );

    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ── Text Character Counter ────────────────────────────── */
function initTextCounter() {
    const textarea = document.getElementById('text-content');
    const counter = document.getElementById('text-char-count');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = len.toLocaleString() + ' characters';
    });
}

/* ── Mobile Navigation ─────────────────────────────────── */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (!hamburger || !overlay) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });

    // Close when clicking a link
    overlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}
