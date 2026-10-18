/**
 * ============================================================================
 * PORTFOLIO & CV JAVASCRIPT ENGINE (v3.0)
 * Nguyễn Tiến Chung - Software Developer
 * ============================================================================
 */

// GLOBAL STATE
let appConfigData = null;
let currentLang = 'vi';
let currentTheme = 'emerald';
let rgbAnimationId = null;
let activeProjectFilter = 'all';

// GET TEXT HELPER: SUPPORTS OBJECT { vi: '...', en: '...' }, STRING, OR NUMBER
function getText(val, lang = currentLang) {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        return val[lang] || val['vi'] || val['en'] || '';
    }
    return String(val);
}

// GET INITIAL LANGUAGE: LOCALSTORAGE -> BROWSER DETECT -> FALLBACK
function getInitialLanguage() {
    const saved = localStorage.getItem('preferred_lang');
    if (saved === 'vi' || saved === 'en') {
        return saved;
    }
    const browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (browserLang.startsWith('vi')) {
        return 'vi';
    }
    return 'en';
}

// GET INITIAL THEME: LOCALSTORAGE -> FALLBACK
function getInitialTheme() {
    return localStorage.getItem('preferred_theme') || 'emerald';
}

// APPLY THEME
function applyTheme(themeName) {
    currentTheme = themeName;
    localStorage.setItem('preferred_theme', themeName);

    if (rgbAnimationId) {
        cancelAnimationFrame(rgbAnimationId);
        rgbAnimationId = null;
    }

    if (themeName === 'rgb') {
        document.documentElement.removeAttribute('data-theme');
        startRgbFlow();
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
        // Clear dynamic style variables so CSS data-theme works cleanly
        document.documentElement.style.removeProperty('--accent-color');
        document.documentElement.style.removeProperty('--accent-light');
        document.documentElement.style.removeProperty('--accent-glow');
        document.documentElement.style.removeProperty('--accent-glow-subtle');
        document.documentElement.style.removeProperty('--border-accent');
    }

    // Update active button in theme menu
    const buttons = document.querySelectorAll('.theme-color-btn');
    buttons.forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// DYNAMIC RGB COLOR SPECTRUM FLOW
function startRgbFlow() {
    let hue = 160;
    function step() {
        hue = (hue + 0.35) % 360;
        const mainColor = `hsl(${hue}, 80%, 52%)`;
        const lightColor = `hsl(${hue}, 88%, 66%)`;
        const glowColor = `hsla(${hue}, 80%, 52%, 0.32)`;
        const subtleGlow = `hsla(${hue}, 80%, 52%, 0.12)`;
        const borderAccent = `hsla(${hue}, 80%, 52%, 0.4)`;

        document.documentElement.style.setProperty('--accent-color', mainColor);
        document.documentElement.style.setProperty('--accent-light', lightColor);
        document.documentElement.style.setProperty('--accent-glow', glowColor);
        document.documentElement.style.setProperty('--accent-glow-subtle', subtleGlow);
        document.documentElement.style.setProperty('--border-accent', borderAccent);

        rgbAnimationId = requestAnimationFrame(step);
    }
    rgbAnimationId = requestAnimationFrame(step);
}

// SWITCH LANGUAGE INSTANTLY WITHOUT RELOADING
function setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('preferred_lang', lang);
    document.documentElement.lang = lang;
    renderLanguageSwitcher();
    updateNavLabels();
    if (appConfigData) {
        renderAll(appConfigData);
    }
}

// RENDER LANGUAGE SWITCHER UI
function renderLanguageSwitcher() {
    const container = document.getElementById('lang-switcher');
    if (!container) return;

    container.innerHTML = `
        <button class="lang-btn ${currentLang === 'vi' ? 'active' : ''}" id="lang-btn-vi" type="button" aria-label="Tiếng Việt">
            <span>🇻🇳</span><span>VI</span>
        </button>
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" id="lang-btn-en" type="button" aria-label="English">
            <span>🇬🇧</span><span>EN</span>
        </button>
    `;

    const viBtn = document.getElementById('lang-btn-vi');
    const enBtn = document.getElementById('lang-btn-en');

    if (viBtn) viBtn.addEventListener('click', () => setLanguage('vi'));
    if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));
}

// UPDATE NAVBAR LABELS
function updateNavLabels() {
    if (!appConfigData || !appConfigData.ui || !appConfigData.ui.nav) return;
    const nav = appConfigData.ui.nav;

    const navAbout = document.querySelector('.nav-link[data-nav="about"] .nav-link-text');
    const navJourney = document.querySelector('.nav-link[data-nav="journey"] .nav-link-text');
    const navSkills = document.querySelector('.nav-link[data-nav="skills"] .nav-link-text');
    const navProjects = document.querySelector('.nav-link[data-nav="projects"] .nav-link-text');
    const navContact = document.querySelector('.nav-link[data-nav="contact"] .nav-link-text');
    const navCvText = document.querySelector('.btn-cv-text');

    if (navAbout) navAbout.textContent = getText(nav.about, currentLang);
    if (navJourney) navJourney.textContent = getText(nav.journey, currentLang);
    if (navSkills) navSkills.textContent = getText(nav.skills, currentLang);
    if (navProjects) navProjects.textContent = getText(nav.projects, currentLang);
    if (navContact) navContact.textContent = getText(nav.contact, currentLang);
    if (navCvText) navCvText.textContent = getText(nav.viewCV, currentLang) || (currentLang === 'vi' ? 'Xem CV' : 'View CV');
}

// TOAST NOTIFICATION SYSTEM
function showToast(message, icon = 'fas fa-check-circle') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// COPY TO CLIPBOARD HELPER
async function copyToClipboard(text, successMsg) {
    const defaultMsg = currentLang === 'vi' ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied to clipboard!';
    const msg = successMsg || defaultMsg;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        showToast(msg, 'fas fa-clipboard-check');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast(text, 'fas fa-info-circle');
    }
}

// INITIALIZE APPLICATION
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    initBgCanvas();
    initSpotlight();
    initScrollSpy();
    initModals();
    initThemePicker();

    currentLang = getInitialLanguage();
    document.documentElement.lang = currentLang;
    renderLanguageSwitcher();

    applyTheme(getInitialTheme());

    try {
        const response = await fetch('config.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText || 'File not found'}`);
        }
        appConfigData = await response.json();
        updateNavLabels();
        renderAll(appConfigData);
        initCommandPalette(appConfigData);
    } catch (error) {
        console.error('Failed to load configuration file:', error);
        showWebError(error);
    }
}

// DISPLAY ERROR ON WEBPAGE
function showWebError(error) {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        const title = currentLang === 'vi' ? 'Bảo Trì Hệ Thống' : 'System Maintenance';
        const msg = currentLang === 'vi' 
            ? 'Không thể tải tệp cấu hình (config.json).' 
            : 'Unable to load configuration file (config.json).';
        const errorDetail = error ? (error.message || String(error)) : 'Unknown error';
        const retryText = currentLang === 'vi' ? 'Thử Lại' : 'Retry';

        appContainer.innerHTML = `
            <div class="card" style="text-align: center; padding: 48px 24px; max-width: 580px; margin: 40px auto;">
                <div style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 16px;">
                    <i class="fas fa-screwdriver-wrench"></i>
                </div>
                <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">
                    ${title}
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 0.95rem; line-height: 1.6;">
                    ${msg}
                </p>
                <div style="background: rgba(0,0,0,0.35); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 22px;">
                    <small style="color: #ef4444; font-family: var(--font-mono); font-size: 0.8rem; word-break: break-all;">
                        <i class="fas fa-circle-exclamation"></i> ${errorDetail}
                    </small>
                </div>
                <button type="button" class="btn btn-primary" id="btn-retry-app" style="display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-rotate-right"></i> ${retryText}
                </button>
            </div>
        `;

        const retryBtn = document.getElementById('btn-retry-app');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => initApp());
        }
    }
}

// BACKGROUND CANVAS PARTICLES (SMOOTH & SUBTLE)
function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 26), 45);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.6 + 0.8,
            alpha: Math.random() * 0.35 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(148, 163, 184, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// MOUSE SPOTLIGHT EFFECT
function initSpotlight() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// NAVBAR SCROLLSPY
function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['profile-card', 'journey-section', 'skills-section', 'projects-section', 'footer-section'];

    window.addEventListener('scroll', () => {
        let currentSection = 'profile-card';
        const scrollPosition = window.scrollY + 160;

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= scrollPosition) {
                currentSection = id;
            }
        });

        navLinks.forEach(link => {
            const target = link.getAttribute('href').replace('#', '');
            if (target === currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }, { passive: true });
}

// THEME PICKER MENU
function initThemePicker() {
    const trigger = document.getElementById('btn-theme-picker');
    const menu = document.getElementById('theme-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== trigger) {
            menu.classList.remove('show');
        }
    });

    const themeButtons = menu.querySelectorAll('.theme-color-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            menu.classList.remove('show');
            const toastMsg = currentLang === 'vi' ? `Đã chuyển theme sang: ${theme.toUpperCase()}` : `Theme switched to: ${theme.toUpperCase()}`;
            showToast(toastMsg, 'fas fa-palette');
        });
    });
}

// CV VIEWER MODAL & CONTROLS
function initModals() {
    const cvModal = document.getElementById('cv-modal');
    const navCvBtn = document.getElementById('nav-btn-cv');
    const closeBtn = document.getElementById('cv-btn-close');

    function openCvModal() {
        if (!cvModal) return;
        cvModal.classList.add('show');
        cvModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeCvModal() {
        if (!cvModal) return;
        cvModal.classList.remove('show');
        cvModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (navCvBtn) {
        navCvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCvModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCvModal);
    }

    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeCvModal();
        });
    }

    // Keyboard navigation (Esc to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCvModal();
            closeCommandPalette();
        }
    });

    window.openCvModal = openCvModal;
    window.closeCvModal = closeCvModal;
}

// COMMAND PALETTE (CTRL+K)
function initCommandPalette(data) {
    const modal = document.getElementById('cmd-palette-modal');
    const trigger = document.getElementById('btn-cmd-palette');
    const input = document.getElementById('cmd-palette-input');
    const list = document.getElementById('cmd-palette-list');
    if (!modal || !list) return;

    let selectedIndex = 0;
    let filteredCommands = [];

    const getCommands = () => [
        {
            title: currentLang === 'vi' ? 'Xem CV Trực Tuyến' : 'View CV Online',
            tag: 'Action',
            icon: 'fas fa-file-pdf',
            action: () => {
                closeCommandPalette();
                window.openCvModal();
            }
        },
        {
            title: currentLang === 'vi' ? 'Tải CV (PDF)' : 'Download CV (PDF)',
            tag: 'Download',
            icon: 'fas fa-download',
            action: () => {
                closeCommandPalette();
                const a = document.createElement('a');
                a.href = 'Nguyen-Tien-Chung-CV.pdf';
                a.download = 'Nguyen-Tien-Chung-CV.pdf';
                a.click();
                showToast(currentLang === 'vi' ? 'Đang tải xuống CV...' : 'Downloading CV...', 'fas fa-download');
            }
        },
        {
            title: currentLang === 'vi' ? 'Sao chép Email (tienchung310725@gmail.com)' : 'Copy Email (tienchung310725@gmail.com)',
            tag: 'Contact',
            icon: 'fas fa-envelope',
            action: () => {
                closeCommandPalette();
                copyToClipboard('tienchung310725@gmail.com', currentLang === 'vi' ? 'Đã sao chép Email!' : 'Copied Email!');
            }
        },
        {
            title: currentLang === 'vi' ? 'Sao chép Số điện thoại (0833190583)' : 'Copy Phone (0833190583)',
            tag: 'Contact',
            icon: 'fas fa-phone',
            action: () => {
                closeCommandPalette();
                copyToClipboard('0833190583', currentLang === 'vi' ? 'Đã sao chép Số điện thoại!' : 'Copied Phone!');
            }
        },
        {
            title: 'GitHub: ChungPr0',
            tag: 'Link',
            icon: 'fab fa-github',
            action: () => {
                closeCommandPalette();
                window.open('https://github.com/ChungPr0', '_blank', 'noopener');
            }
        },
        {
            title: currentLang === 'vi' ? 'Đổi ngôn ngữ sang English' : 'Đổi ngôn ngữ sang Tiếng Việt',
            tag: 'Settings',
            icon: 'fas fa-globe',
            action: () => {
                closeCommandPalette();
                setLanguage(currentLang === 'vi' ? 'en' : 'vi');
            }
        },
        {
            title: currentLang === 'vi' ? 'Theme: Emerald (Spring Boot)' : 'Theme: Emerald',
            tag: 'Theme',
            icon: 'fas fa-palette',
            action: () => {
                closeCommandPalette();
                applyTheme('emerald');
            }
        },
        {
            title: currentLang === 'vi' ? 'Theme: Electric Cyan' : 'Theme: Cyan',
            tag: 'Theme',
            icon: 'fas fa-palette',
            action: () => {
                closeCommandPalette();
                applyTheme('cyan');
            }
        },
        {
            title: currentLang === 'vi' ? 'Theme: Cyber Violet' : 'Theme: Violet',
            tag: 'Theme',
            icon: 'fas fa-palette',
            action: () => {
                closeCommandPalette();
                applyTheme('violet');
            }
        },
        {
            title: currentLang === 'vi' ? 'Theme: RGB Spectrum Flow' : 'Theme: RGB Flow',
            tag: 'Theme',
            icon: 'fas fa-rainbow',
            action: () => {
                closeCommandPalette();
                applyTheme('rgb');
            }
        },
        {
            title: currentLang === 'vi' ? 'Cuộn tới: Dự án nổi bật' : 'Scroll to: Projects',
            tag: 'Navigation',
            icon: 'fas fa-layer-group',
            action: () => {
                closeCommandPalette();
                document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        },
        {
            title: currentLang === 'vi' ? 'Cuộn tới: Học vấn & Lộ trình' : 'Scroll to: Journey',
            tag: 'Navigation',
            icon: 'fas fa-route',
            action: () => {
                closeCommandPalette();
                document.getElementById('journey-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    ];

    function renderCommandList() {
        const query = (input.value || '').trim().toLowerCase();
        const all = getCommands();
        filteredCommands = all.filter(c => c.title.toLowerCase().includes(query) || c.tag.toLowerCase().includes(query));

        if (filteredCommands.length === 0) {
            list.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    ${currentLang === 'vi' ? 'Không tìm thấy kết quả phù hợp' : 'No matching results'}
                </div>
            `;
            return;
        }

        if (selectedIndex >= filteredCommands.length) selectedIndex = 0;

        list.innerHTML = filteredCommands.map((cmd, idx) => `
            <div class="cmd-item ${idx === selectedIndex ? 'selected' : ''}" data-idx="${idx}">
                <div class="cmd-item-left">
                    <i class="${cmd.icon}"></i>
                    <span>${cmd.title}</span>
                </div>
                <span class="cmd-item-tag">${cmd.tag}</span>
            </div>
        `).join('');

        const items = list.querySelectorAll('.cmd-item');
        items.forEach(it => {
            it.addEventListener('click', () => {
                const idx = parseInt(it.dataset.idx, 10);
                if (filteredCommands[idx]) filteredCommands[idx].action();
            });
        });
    }

    function openCommandPalette() {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        input.value = '';
        selectedIndex = 0;
        renderCommandList();
        setTimeout(() => input.focus(), 50);
    }

    function closeCommandPalette() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (trigger) trigger.addEventListener('click', openCommandPalette);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCommandPalette();
    });

    input.addEventListener('input', () => {
        selectedIndex = 0;
        renderCommandList();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredCommands.length > 0) {
                selectedIndex = (selectedIndex + 1) % filteredCommands.length;
                renderCommandList();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (filteredCommands.length > 0) {
                selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
                renderCommandList();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
            }
        }
    });

    // Global shortcut Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (modal.classList.contains('show')) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        }
    });

    window.closeCommandPalette = closeCommandPalette;
}

// RENDER ALL SECTIONS
function renderAll(data) {
    if (!data) return;
    const ui = data.ui || {};

    renderMeta(data.meta);
    renderProfile(data.personal, ui);
    renderStats(data.stats, ui);
    renderJourney(data.journey, ui);
    renderSkills(data.skills, ui);
    renderProjects(data.projects, ui);
    renderFooter({
        socials: data.socials || [],
        footer: data.footer,
        personal: data.personal,
        ui: ui
    });
}

// META TAGS UPDATE
function renderMeta(meta) {
    if (!meta) return;
    const pageTitle = getText(meta.title, currentLang);
    if (pageTitle) document.title = pageTitle;

    const descTag = document.querySelector('meta[name="description"]');
    const desc = getText(meta.description, currentLang);
    if (descTag && desc) descTag.setAttribute('content', desc);

    const faviconTag = document.getElementById('favicon-link');
    if (faviconTag && meta.favicon) faviconTag.setAttribute('href', meta.favicon);
}

// 1. HERO / PROFILE CARD
function renderProfile(personal, ui) {
    const profileCard = document.getElementById('profile-card');
    if (!profileCard || !personal) return;
    ui = ui || {};

    const name = getText(personal.name, currentLang);
    const title = getText(personal.title, currentLang);
    const subTitle = getText(personal.subTitle, currentLang);
    const gender = getText(personal.gender, currentLang);
    const location = getText(personal.location, currentLang);
    const hometown = getText(personal.hometown, currentLang);
    const bio = getText(personal.bio, currentLang);
    const statusText = getText(personal.status, currentLang) || 'Available';
    const statusHover = getText(ui.statusHover, currentLang) || 'Contact Now';
    const livesInText = getText(ui.livesIn, currentLang) || 'Based in';
    const hometownText = getText(ui.hometown, currentLang) || 'Hometown';
    const viewResumeText = getText(ui.viewResume, currentLang) || 'Xem CV Trực Tuyến';
    const downloadResumeText = getText(ui.downloadResume, currentLang) || 'Tải CV (PDF)';

    profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-wrapper">
                <img src="${personal.avatar || 'avatar.jpg'}" alt="${name}" class="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=090a0f'">
            </div>
            <div class="profile-info">
                <div class="profile-top-row">
                    <h1 class="profile-name">${name}</h1>
                    <a href="#footer-section" class="status-pulse-wrapper" id="btn-status-contact" title="${statusHover}">
                        <span class="status-pulse">
                            <span class="dot-core"></span>
                            <span class="dot-ring"></span>
                        </span>
                        <span class="status-text-default">${statusText}</span>
                    </a>
                </div>

                <div class="profile-title">
                    <i class="fas fa-terminal"></i> ${title}
                </div>

                ${subTitle ? `
                    <div class="profile-subtitle">
                        <i class="fas fa-graduation-cap"></i> ${subTitle}
                    </div>
                ` : ''}

                <div class="profile-details-grid">
                    ${personal.gpa ? `
                        <span class="detail-item">
                            <i class="fas fa-award"></i> GPA: ${personal.gpa}
                        </span>
                    ` : ''}
                    ${gender || personal.birthYear ? `
                        <span class="detail-item">
                            <i class="fas fa-user"></i> 
                            ${gender || ''}${gender && personal.birthYear ? ' • ' : ''}${personal.birthYear || ''}
                        </span>
                    ` : ''}
                    ${location ? `<span class="detail-item"><i class="fas fa-location-dot"></i> ${livesInText}: ${location}</span>` : ''}
                    ${hometown ? `<span class="detail-item"><i class="fas fa-house"></i> ${hometownText}: ${hometown}</span>` : ''}
                </div>

                <p class="profile-bio">${bio}</p>

                <div class="profile-actions">
                    <button type="button" class="btn btn-primary" id="btn-hero-view-cv">
                        <i class="fas fa-file-pdf"></i> ${viewResumeText}
                    </button>
                    <a href="${personal.resumeUrl || 'Nguyen-Tien-Chung-CV.pdf'}" download="Nguyen-Tien-Chung-CV.pdf" class="btn" id="btn-hero-download-cv">
                        <i class="fas fa-download"></i> ${downloadResumeText}
                    </a>
                    ${personal.email ? `
                        <button type="button" class="btn btn-copy" id="btn-copy-email-hero" title="Copy Email">
                            <i class="fas fa-copy"></i> ${personal.email}
                        </button>
                    ` : ''}
                    ${personal.phone ? `
                        <button type="button" class="btn btn-copy" id="btn-copy-phone-hero" title="Copy Phone">
                            <i class="fas fa-phone"></i> ${personal.phone}
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Hook CV Buttons
    const heroViewCvBtn = document.getElementById('btn-hero-view-cv');
    if (heroViewCvBtn) {
        heroViewCvBtn.addEventListener('click', () => {
            if (window.openCvModal) window.openCvModal();
        });
    }

    // Hook Copy Buttons
    const copyEmailHero = document.getElementById('btn-copy-email-hero');
    if (copyEmailHero && personal.email) {
        copyEmailHero.addEventListener('click', () => {
            copyToClipboard(personal.email, currentLang === 'vi' ? 'Đã sao chép Email vào bộ nhớ tạm!' : 'Email copied to clipboard!');
        });
    }

    const copyPhoneHero = document.getElementById('btn-copy-phone-hero');
    if (copyPhoneHero && personal.phone) {
        copyPhoneHero.addEventListener('click', () => {
            copyToClipboard(personal.phone, currentLang === 'vi' ? 'Đã sao chép Số điện thoại!' : 'Phone number copied to clipboard!');
        });
    }
}

// 2. STATS & HIGHLIGHTS
function renderStats(stats, ui) {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;
    if (!Array.isArray(stats) || stats.length === 0) {
        statsSection.style.display = 'none';
        return;
    }
    statsSection.style.display = '';

    const statsTitle = getText(ui.statsTitle, currentLang) || 'Key Highlights';

    const statsHtml = stats.map(s => `
        <div class="stat-item">
            ${s.icon ? `<div class="stat-icon"><i class="${s.icon}"></i></div>` : ''}
            <div class="stat-num" data-target="${s.num}">${s.num}</div>
            <div class="stat-label">${getText(s.label, currentLang)}</div>
        </div>
    `).join('');

    statsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-chart-simple"></i> ${statsTitle}
            </div>
            <span class="section-badge">Verified</span>
        </div>
        <div class="stats-grid">
            ${statsHtml}
        </div>
    `;

    initStatObserver();
}

function initStatObserver() {
    const statNums = document.querySelectorAll('.stat-num');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStatNum(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNums.forEach(num => observer.observe(num));
    }
}

function animateStatNum(el) {
    const targetStr = el.dataset.target || el.innerText;
    const match = targetStr.match(/([\d\.]+)/);
    if (!match) return;

    const targetVal = parseFloat(match[1]);
    const suffix = targetStr.replace(match[1], '');
    const isFloat = match[1].includes('.');

    let currentVal = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        currentVal = easeProgress * targetVal;

        if (isFloat) {
            el.innerText = currentVal.toFixed(1) + suffix;
        } else {
            el.innerText = Math.floor(currentVal) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = targetStr;
        }
    }

    requestAnimationFrame(update);
}

// 3. JOURNEY / EDUCATION & TIMELINE
function renderJourney(journey, ui) {
    const journeySection = document.getElementById('journey-section');
    if (!journeySection) return;
    if (!Array.isArray(journey) || journey.length === 0) {
        journeySection.style.display = 'none';
        return;
    }
    journeySection.style.display = '';

    const journeyTitle = getText(ui.journeyTitle, currentLang) || (currentLang === 'vi' ? 'Học Vấn & Kinh Nghiệm' : 'Education & Experience');

    const itemsHtml = journey.map(item => `
        <div class="timeline-item">
            <div class="timeline-marker">
                <div class="timeline-marker-dot"></div>
            </div>
            <div class="timeline-content">
                <div class="timeline-top">
                    <span class="timeline-period">${item.period}</span>
                    ${item.badge ? `<span class="timeline-badge">${item.badge}</span>` : ''}
                </div>
                <h3 class="timeline-title">${getText(item.title, currentLang)}</h3>
                <div class="timeline-role">${getText(item.role, currentLang)}</div>
                <p class="timeline-desc">${getText(item.desc, currentLang)}</p>
            </div>
        </div>
    `).join('');

    journeySection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-route"></i> ${journeyTitle}
            </div>
            <span class="section-badge">Career Track</span>
        </div>
        <div class="timeline">
            ${itemsHtml}
        </div>
    `;
}

// 4. SKILLS & TECHNOLOGIES
function renderSkills(skills, ui) {
    const skillsSection = document.getElementById('skills-section');
    if (!skillsSection) return;
    if (!Array.isArray(skills) || skills.length === 0) {
        skillsSection.style.display = 'none';
        return;
    }
    skillsSection.style.display = '';

    const skillsTitle = getText(ui.skillsTitle, currentLang) || (currentLang === 'vi' ? 'Kỹ Năng & Công Nghệ' : 'Skills & Technologies');

    const categoriesHtml = skills.map(cat => `
        <div class="skill-category">
            <div class="skill-category-title">
                <i class="${cat.icon || 'fas fa-code'}"></i> ${getText(cat.category, currentLang)}
            </div>
            <div class="skill-tags">
                ${(cat.items || []).map(item => {
                    const iconHtml = (item && item.icon) ? `<i class="${item.icon}"></i>` : '';
                    const itemName = (typeof item === 'object' && item !== null) ? item.name : item;
                    const isHighlight = item && item.highlight;
                    return `<span class="skill-tag ${isHighlight ? 'highlight' : ''}">${iconHtml}${getText(itemName, currentLang)}</span>`;
                }).join('')}
            </div>
        </div>
    `).join('');

    skillsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-code"></i> ${skillsTitle}
            </div>
            <span class="section-badge">Tech Stack</span>
        </div>
        <div class="skills-container">
            ${categoriesHtml}
        </div>
    `;
}

// 5. FEATURED PROJECTS
function renderProjects(projects, ui) {
    const projectsSection = document.getElementById('projects-section');
    if (!projectsSection) return;
    if (!Array.isArray(projects) || projects.length === 0) {
        projectsSection.style.display = 'none';
        return;
    }
    projectsSection.style.display = '';

    const projectsTitle = getText(ui.projectsTitle, currentLang) || (currentLang === 'vi' ? 'Dự Án Nổi Bật' : 'Featured Projects');
    const filterAll = getText(ui.projectsFilterAll, currentLang) || (currentLang === 'vi' ? 'Tất cả' : 'All');
    const filterBackend = getText(ui.projectsFilterBackend, currentLang) || 'Backend & API';
    const filterSystem = getText(ui.projectsFilterSystem, currentLang) || 'Desktop & Bot';

    const filteredProjects = projects.filter(p => {
        if (activeProjectFilter === 'all') return true;
        return p.category === activeProjectFilter;
    });

    const projectsHtml = filteredProjects.map(proj => {
        const linksHtml = (proj.links || []).map(link => {
            const rawLabel = link.label || link.name || (link.type === 'github' ? 'GitHub' : 'Link');
            const label = getText(rawLabel, currentLang);
            return `
                <a href="${link.url}" target="_blank" rel="noopener" class="project-link" title="${label}" aria-label="${label}">
                    <i class="${link.icon || 'fab fa-github'}"></i>
                    <span>${label}</span>
                    <i class="fas fa-arrow-up-right-from-square link-arrow"></i>
                </a>
            `;
        }).join('');

        const techHtml = (proj.tech || []).map(t => `
            <span class="tech-tag">${getText(t, currentLang)}</span>
        `).join('');

        const highlightsHtml = (proj.highlights || []).map(hl => `
            <li class="project-highlight-item">
                <i class="fas fa-angle-right"></i>
                <span>${getText(hl, currentLang)}</span>
            </li>
        `).join('');

        const projTitle = getText(proj.title, currentLang);
        const projDesc = getText(proj.description, currentLang);
        const projRole = getText(proj.role, currentLang);

        return `
            <div class="project-item" data-category="${proj.category || 'all'}">
                <div class="project-top">
                    <div class="project-header-info">
                        <div class="project-meta-pills">
                            ${projRole ? `<span class="project-pill-role">${projRole}</span>` : ''}
                            ${proj.period ? `<span class="project-pill-period">${proj.period}</span>` : ''}
                            ${proj.tag ? `<span class="project-pill-tag">${proj.tag}</span>` : ''}
                        </div>
                        <h3 class="project-title" style="color: ${proj.iconColor || 'var(--text-primary)'}">
                            <i class="${proj.icon || 'fas fa-folder'}"></i>
                            ${projTitle}
                        </h3>
                    </div>
                    <div class="project-links">
                        ${linksHtml}
                    </div>
                </div>

                <p class="project-desc">${projDesc}</p>

                ${highlightsHtml ? `
                    <ul class="project-highlights">
                        ${highlightsHtml}
                    </ul>
                ` : ''}

                <div class="project-tech-list">
                    ${techHtml}
                </div>
            </div>
        `;
    }).join('');

    projectsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-layer-group"></i> ${projectsTitle}
            </div>
            <span class="section-badge">${filteredProjects.length} Projects</span>
        </div>

        <div class="projects-filter-bar">
            <button type="button" class="filter-btn ${activeProjectFilter === 'all' ? 'active' : ''}" data-filter="all">${filterAll}</button>
            <button type="button" class="filter-btn ${activeProjectFilter === 'backend' ? 'active' : ''}" data-filter="backend">${filterBackend}</button>
            <button type="button" class="filter-btn ${activeProjectFilter === 'system' ? 'active' : ''}" data-filter="system">${filterSystem}</button>
        </div>

        <div class="projects-list">
            ${projectsHtml}
        </div>
    `;

    // Filter Buttons Hook
    const filterBtns = projectsSection.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeProjectFilter = btn.dataset.filter;
            renderProjects(projects, ui);
        });
    });
}

// 6. FOOTER & SOCIALS DOCK
function renderFooter(data) {
    const footerSection = document.getElementById('footer-section');
    if (!footerSection || !data) return;

    const socials = data.socials || [];
    const footerInfo = data.footer || {};
    const personal = data.personal || {};
    const ui = data.ui || {};
    const currentYear = new Date().getFullYear();

    const contactTitle = getText(ui.contactTitle, currentLang) || (currentLang === 'vi' ? 'Kết Nối & Liên Hệ' : 'Contact & Connect');
    const slogan = getText(footerInfo.slogan, currentLang);
    const author = getText(footerInfo.author, currentLang) || personal.name || 'Nguyễn Tiến Chung';

    const socialsHtml = socials.map(soc => {
        const isMailto = (soc.url || '').startsWith('mailto:');
        const isTel = (soc.url || '').startsWith('tel:');
        const targetAttr = (isMailto || isTel) ? '' : 'target="_blank" rel="noopener"';
        const socName = getText(soc.name, currentLang);
        return `
            <a href="${soc.url}" ${targetAttr} class="social-btn" aria-label="${socName}" title="${socName}">
                <i class="${soc.icon}"></i>
            </a>
        `;
    }).join('');

    footerSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-paper-plane"></i> ${contactTitle}
            </div>
            <span class="section-badge">Get in Touch</span>
        </div>

        <div class="contact-quick-cards">
            ${personal.email ? `
                <div class="contact-quick-card" id="card-copy-email">
                    <div class="contact-card-info">
                        <div class="contact-card-icon"><i class="fas fa-envelope"></i></div>
                        <div>
                            <div class="contact-card-text">${personal.email}</div>
                            <div class="contact-card-sub">${currentLang === 'vi' ? 'Nhấn để sao chép email' : 'Click to copy email'}</div>
                        </div>
                    </div>
                    <button type="button" class="contact-card-copy-btn">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            ` : ''}

            ${personal.phone ? `
                <div class="contact-quick-card" id="card-copy-phone">
                    <div class="contact-card-info">
                        <div class="contact-card-icon"><i class="fas fa-phone"></i></div>
                        <div>
                            <div class="contact-card-text">${personal.phone}</div>
                            <div class="contact-card-sub">${currentLang === 'vi' ? 'Nhấn để gọi hoặc sao chép' : 'Click to call or copy'}</div>
                        </div>
                    </div>
                    <button type="button" class="contact-card-copy-btn">
                        <i class="fas fa-phone-volume"></i>
                    </button>
                </div>
            ` : ''}
        </div>

        <div class="socials-dock-wrapper">
            <div class="socials-dock">
                ${socialsHtml}
            </div>
        </div>

        <div class="footer-info">
            ${slogan ? `<div class="footer-slogan">"${slogan}"</div>` : ''}
            <div class="footer-author">© ${currentYear} ${author} • Built with Passion & Clean Code</div>
        </div>
    `;

    // Hook quick contact cards
    const emailCard = document.getElementById('card-copy-email');
    if (emailCard && personal.email) {
        emailCard.addEventListener('click', () => {
            copyToClipboard(personal.email, currentLang === 'vi' ? 'Đã sao chép Email vào bộ nhớ tạm!' : 'Email copied to clipboard!');
        });
    }

    const phoneCard = document.getElementById('card-copy-phone');
    if (phoneCard && personal.phone) {
        phoneCard.addEventListener('click', () => {
            copyToClipboard(personal.phone, currentLang === 'vi' ? 'Đã sao chép Số điện thoại!' : 'Phone number copied to clipboard!');
        });
    }
}
