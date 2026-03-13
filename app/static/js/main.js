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
    initQrUpload();
    initParticles();
    initStatsCounter();
    initScrollReveal();
    initTextCounter();
    initMobileNav();
    initNavLinks();
    initMeter();
    initShareBtn();
    initWebsiteCheck();
    initFactCheck();
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

/* ── QR AJAX Submission ────────────────────────────────── */
function initQrUpload() {
    const submitBtn = document.getElementById('qr-submit-btn');
    const fileInput = document.getElementById('qr-file-input');
    const resultDiv = document.getElementById('qr-result');

    if (!submitBtn || !fileInput || !resultDiv) return;

    submitBtn.addEventListener('click', async () => {
        if (!fileInput.files.length) return;

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader" class="btn__icon spinner"></i> Scanning...';
        if (window.lucide) lucide.createIcons();
        
        resultDiv.style.display = "none";

        try {
            const response = await fetch("/api/scan-qr", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            resultDiv.style.display = "block";
            
            if (data.status === "error") {
                resultDiv.className = "alert alert--danger";
                resultDiv.innerHTML = `<strong>Error:</strong> ${data.message}`;
            } else if (data.status === "success") {
                resultDiv.className = "alert alert--success";
                resultDiv.innerHTML = `<strong>${data.message}:</strong> <a href="${data.data}" target="_blank" style="word-break: break-all; color: inherit; text-decoration: underline;">${data.data}</a>`;
            } else if (data.status === "warning") {
                resultDiv.className = "alert alert--warning";
                resultDiv.innerHTML = `<strong>${data.message}:</strong> <span style="word-break: break-all;">${data.data}</span>`;
            } else if (data.status === "critical") {
                // Massive warning for payments
                resultDiv.className = "alert alert--danger";
                resultDiv.style.borderWidth = "2px";
                resultDiv.style.padding = "20px";
                resultDiv.innerHTML = `
                    <div style="font-size: 1.2rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        <i data-lucide="alert-triangle" style="vertical-align: middle; margin-right: 8px;"></i>
                        <strong>${data.message}</strong>
                    </div>
                    <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>Type:</strong> ${data.details.type}</p>
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>Payee Name:</strong> ${data.details.payee_name}</p>
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>UPI ID (VPA):</strong> ${data.details.payee_vpa}</p>
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>Amount (INR):</strong> ${data.details.amount}</p>
                        <p style="margin-top: 10px; font-size: 0.85em; opacity: 0.8; word-break: break-all; color: #f0ece4;">Raw URI: ${data.data}</p>
                    </div>
                `;
            }

            if (window.lucide) lucide.createIcons();

        } catch (err) {
            resultDiv.style.display = "block";
            resultDiv.className = "alert alert--danger";
            resultDiv.innerHTML = `<strong>Error:</strong> Could not reach the server.`;
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
    });
}

/* ── Website Verification AJAX Submission ──────────────── */
function initWebsiteCheck() {
    const submitBtn = document.getElementById('website-submit-btn');
    const inputField = document.getElementById('website-url');
    const resultDiv = document.getElementById('website-result');

    if (!submitBtn || !inputField || !resultDiv) return;

    submitBtn.addEventListener('click', async () => {
        const url = inputField.value.trim();
        if (!url) {
            resultDiv.style.display = "block";
            resultDiv.className = "alert alert--danger";
            resultDiv.innerHTML = `<strong>Error:</strong> Please enter a valid URL.`;
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader" class="btn__icon spinner"></i> Verifying...';
        if (window.lucide) lucide.createIcons();
        
        resultDiv.style.display = "none";

        try {
            const response = await fetch("/api/check-website", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: url })
            });
            const data = await response.json();

            resultDiv.style.display = "block";
            
            if (data.status === "error") {
                resultDiv.className = "alert alert--danger";
                resultDiv.innerHTML = `<strong>Error:</strong> ${data.message}`;
            } else if (data.status === "success") {
                resultDiv.className = "alert alert--success";
                resultDiv.innerHTML = `<strong>${data.message}</strong> <br><span style="word-break: break-all; font-size: 0.9em; opacity: 0.8;">Domain: ${data.details.domain}</span>`;
            } else if (data.status === "warning") {
                resultDiv.className = "alert alert--warning";
                resultDiv.innerHTML = `<strong>${data.message}</strong> <br><span style="word-break: break-all; font-size: 0.9em; opacity: 0.8;">${data.details.reason}</span>`;
            } else if (data.status === "danger") {
                resultDiv.className = "alert alert--danger";
                resultDiv.style.borderWidth = "2px";
                resultDiv.style.padding = "20px";
                resultDiv.innerHTML = `
                    <div style="font-size: 1.2rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        <i data-lucide="shield-alert" style="vertical-align: middle; margin-right: 8px;"></i>
                        <strong>${data.message}</strong>
                    </div>
                    <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>Domain:</strong> ${data.details.domain}</p>
                        <p style="margin-bottom: 5px; color: #f0ece4;"><strong>Threat Type:</strong> ${data.details.reason}</p>
                        <p style="margin-top: 10px; font-size: 0.85em; opacity: 0.8; word-break: break-all; color: #f0ece4;">Checked URL: ${data.data}</p>
                    </div>
                `;
            }

            if (window.lucide) lucide.createIcons();

        } catch (err) {
            resultDiv.style.display = "block";
            resultDiv.className = "alert alert--danger";
            resultDiv.innerHTML = `<strong>Error:</strong> Could not reach the server.`;
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
    });
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
        '.section-header, .step-card, .pricing-card, .panel-card, .stats-bar, .r-card, .results-page__header, .history-page__header'
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

/* ── Score Meter Animation (Results Page) ──────────────── */
function initMeter() {
    const meter = document.getElementById('meter');
    if (!meter) return;

    const score = parseFloat(meter.getAttribute('data-score')) || 0;
    const fill = meter.querySelector('.meter__fill');
    const numberEl = document.getElementById('meter-number');
    const circumference = 326.73;

    // Animate after a short delay
    setTimeout(() => {
        const offset = circumference - (circumference * score / 100);
        fill.style.strokeDashoffset = offset;

        // Animate the number
        const duration = 1500;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            numberEl.textContent = Math.round(eased * score);
            if (progress < 1) requestAnimationFrame(updateNumber);
        }
        requestAnimationFrame(updateNumber);
    }, 300);
}

/* ── Share Button (Results Page) ───────────────────────── */
function initShareBtn() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        const url = shareBtn.getAttribute('data-url') || window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'AI Reality Detector Result', url });
            } else {
                await navigator.clipboard.writeText(url);
                const original = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i data-lucide="check" class="btn__icon"></i> Copied!';
                if (window.lucide) lucide.createIcons();
                setTimeout(() => {
                    shareBtn.innerHTML = original;
                    if (window.lucide) lucide.createIcons();
                }, 2000);
            }
        } catch {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
    });
}

/* ── Fact Check AJAX Submission ────────────────────────── */
const newsTranslations = {
    hi: {
        error: "त्रुटि",
        enter_query: "कृपया समाचार लेख का URL दर्ज करें या लेख पेस्ट करें।",
        verifying: "पुष्टि की जा रही है...",
        analysis_for: "विश्लेषण का विषय:",
        related_news: "संबंधित समाचार लेख",
        fact_checks: "तथ्य जांच परिणाम (Fact Checks)",
        no_results: "कोई संदिग्ध दावा नहीं मिला",
        no_results_desc: "हमारे डेटाबेस में इस विषय के लिए कोई ज्ञात विवाद नहीं हैं।",
        read_more: "पूरी रिपोर्ट देखें",
        source: "स्रोत",
        rating: "रेटिंग",
        query: "प्रश्न"
    },
    en: {
        error: "Error",
        enter_query: "Please enter a news article URL or paste text.",
        verifying: "Verifying...",
        analysis_for: "Analysis for:",
        related_news: "Related News Articles",
        fact_checks: "Fact Check Results",
        no_results: "No Suspicious Claims Found",
        no_results_desc: "Our database shows no known disputes or fact-checks for this topic.",
        read_more: "View Full Report",
        source: "Source",
        rating: "Rating",
        query: "Query"
    }
};

let newsCurrentLang = 'en';

function initFactCheck() {
    const newsSubmitBtn = document.getElementById('news-submit-btn');
    const newsText = document.getElementById('news-text');
    const newsUrl = document.getElementById('news-url');
    const newsResult = document.getElementById('news-result');
    const langBtns = document.querySelectorAll('#news-lang-toggle .lang-btn');

    if (!newsSubmitBtn || !newsResult) return;

    // Language Toggle Handling
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#f0ece4';
            });
            btn.classList.add('active');
            btn.style.background = '#a67c00';
            btn.style.color = '#000';
            newsCurrentLang = btn.getAttribute('data-lang');
        });
    });

    newsSubmitBtn.addEventListener('click', async () => {
        const query = (newsText ? newsText.value.trim() : "") || (newsUrl ? newsUrl.value.trim() : "");
        const t = newsTranslations[newsCurrentLang];

        if (!query) {
            newsResult.style.display = "block";
            newsResult.className = "alert alert--danger";
            newsResult.innerHTML = `<strong>${t.error}:</strong> ${t.enter_query}`;
            return;
        }

        newsSubmitBtn.disabled = true;
        const originalText = newsSubmitBtn.innerHTML;
        newsSubmitBtn.innerHTML = `<i data-lucide="loader" class="btn__icon spinner"></i> ${t.verifying}`;
        if (window.lucide) lucide.createIcons();
        
        newsResult.style.display = "none";

        try {
            const response = await fetch("/api/fact-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query })
            });
            const { data, status } = await response.json();

            newsResult.style.display = "block";
            
            if (status === "error") {
                newsResult.className = "alert alert--danger";
                newsResult.innerHTML = `<strong>${t.error}:</strong> ${t.enter_query}`;
            } else {
                const results = data.fact_checks || [];
                const news = data.related_news || [];
                const queryUsed = data.query_used || query;
                const score = data.credibility_score || 0;
                const verdict = data.verdict || "INCONCLUSIVE";

                // 1. Animate Score Meter
                const scoreContainer = document.getElementById('news-score-container');
                const scoreValue = document.getElementById('news-score-value');
                const meterFill = document.getElementById('news-meter-fill');
                const meterEl = document.getElementById('news-meter');
                const verdictBadge = document.getElementById('news-verdict-badge');
                const verdictText = document.getElementById('news-verdict-text');

                if (scoreContainer) {
                    scoreContainer.style.display = "block";
                    
                    // Risk level coloring
                    let risk = "medium";
                    if (score >= 70) risk = "low";
                    else if (score <= 35) risk = "high";
                    if (meterEl) meterEl.setAttribute('data-risk', risk);

                    // Animate number
                    let currentScore = 0;
                    const duration = 1500;
                    const startTime = performance.now();

                    function animateScore(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        currentScore = Math.floor(progress * score);
                        if (scoreValue) scoreValue.textContent = currentScore;
                        
                        if (progress < 1) {
                            requestAnimationFrame(animateScore);
                        }
                    }
                    requestAnimationFrame(animateScore);

                    // Animate circle
                    const radius = 45;
                    const circumference = 2 * Math.PI * radius;
                    if (meterFill) {
                        const offset = circumference - (score / 100) * circumference;
                        meterFill.style.strokeDashoffset = offset;
                    }

                    // Verdict Badge
                    if (verdictBadge && verdictText) {
                        verdictBadge.style.display = "inline-flex";
                        verdictBadge.className = `risk-badge risk-badge--${risk}`;
                        verdictText.textContent = verdict;
                    }
                }

                newsResult.style.display = "block";
                newsResult.className = "alert alert--warning";
                newsResult.style.borderWidth = "2px";
                newsResult.style.maxHeight = "500px";
                newsResult.style.overflowY = "auto";
                
                let html = `
                    <div style="margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                        <span style="font-size: 0.8em; opacity: 0.7; text-transform: uppercase;">${t.analysis_for}</span>
                        <p style="font-weight: 700; color: #f0ece4; margin-top: 5px; font-size: 1.1em;">"${queryUsed}"</p>
                    </div>
                `;

                // Related News (Strictly Relevant)
                if (news.length > 0) {
                    html += `<h4 style="margin-bottom: 12px; color: #a67c00; font-size: 0.9em; text-transform: uppercase;">${t.related_news}</h4>`;
                    html += `<div style="display: grid; gap: 10px; margin-bottom: 25px;">`;
                    news.forEach(item => {
                        html += `
                            <a href="${item.url}" target="_blank" style="display: block; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(166,124,0,0.2); transition: all 0.2s;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <span style="font-size: 0.7em; color: #a67c00; font-weight: 700;">${item.source} (${item.relevance}%)</span>
                                    <i data-lucide="external-link" style="width: 12px; height: 12px; opacity: 0.5;"></i>
                                </div>
                                <p style="font-size: 0.9em; color: #f0ece4; line-height: 1.4;">${item.title}</p>
                            </a>
                        `;
                    });
                    html += `</div>`;
                }

                // Fact Checks
                if (results.length > 0) {
                    html += `<h4 style="margin-bottom: 12px; color: #a67c00; font-size: 0.9em; text-transform: uppercase;">${t.fact_checks}</h4>`;
                    html += `<div style="display: grid; gap: 12px;">`;
                    results.forEach(res => {
                        const ratingColor = getRatingColor(res.rating);
                        html += `
                            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border-left: 4px solid ${ratingColor};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 0.7em; background: ${ratingColor}; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: 800; text-transform: uppercase;">${res.rating}</span>
                                    <span style="font-size: 0.75em; opacity: 0.6;">${res.publisher}</span>
                                </div>
                                <p style="font-size: 0.9em; line-height: 1.4; color: #f0ece4; margin-bottom: 8px;">${res.claim}</p>
                                <a href="${res.url}" target="_blank" style="font-size: 0.8em; color: #a67c00; text-decoration: underline;">${t.read_more}</a>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }

                if (news.length === 0 && results.length === 0) {
                    if (scoreContainer) scoreContainer.style.display = "none";
                    newsResult.className = "alert alert--success";
                    html = `
                        <div style="display: flex; align-items: flex-start; gap: 15px; padding: 5px;">
                            <i data-lucide="shield-check" style="color: #2ed573; width: 24px; height: 24px;"></i>
                            <div>
                                <strong style="font-size: 1.1em; display: block; margin-bottom: 4px;">${t.no_results}</strong>
                                <p style="font-size: 0.9em; opacity: 0.8; line-height: 1.4;">${t.no_results_desc}</p>
                            </div>
                        </div>
                    `;
                }
                
                newsResult.innerHTML = html;
            }

            if (window.lucide) lucide.createIcons();

        } catch (err) {
            newsResult.style.display = "block";
            newsResult.className = "alert alert--danger";
            newsResult.innerHTML = `<strong>${newsTranslations[newsCurrentLang].error}:</strong> Could not reach the server.`;
        }

        newsSubmitBtn.innerHTML = originalText;
        newsSubmitBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
    });
}

function getRatingColor(rating) {
    const r = rating.toLowerCase();
    if (r.includes('false') || r.includes('fake') || r.includes('wrong')) return '#ff4757';
    if (r.includes('true') || r.includes('correct')) return '#2ed573';
    if (r.includes('partially') || r.includes('mixed')) return '#ffa502';
    return '#eccc68'; // Default gold-ish
}
