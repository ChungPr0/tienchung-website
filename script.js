// MULTI-LANGUAGE STATE
let appConfigData = null;
let currentLang = 'vi';
let lastAppError = null;

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

// SWITCH LANGUAGE INSTANTLY WITHOUT RELOADING
function setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('preferred_lang', lang);
    document.documentElement.lang = lang;
    renderLanguageSwitcher();
    if (appConfigData) {
        renderAll(appConfigData);
    } else {
        showWebError(lastAppError);
    }
}

// RENDER LANGUAGE SWITCHER UI
function renderLanguageSwitcher() {
    const container = document.getElementById('lang-switcher');
    if (!container) return;

    container.innerHTML = `
        <button class="lang-btn ${currentLang === 'vi' ? 'active' : ''}" id="lang-btn-vi" type="button" aria-label="Tiếng Việt">
            <span class="lang-flag">🇻🇳</span><span class="lang-code">VI</span>
        </button>
        <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" id="lang-btn-en" type="button" aria-label="English">
            <span class="lang-flag">🇬🇧</span><span class="lang-code">EN</span>
        </button>
    `;

    const viBtn = document.getElementById('lang-btn-vi');
    const enBtn = document.getElementById('lang-btn-en');

    if (viBtn) {
        viBtn.addEventListener('click', () => {
            if (currentLang !== 'vi') setLanguage('vi');
        });
    }

    if (enBtn) {
        enBtn.addEventListener('click', () => {
            if (currentLang !== 'en') setLanguage('en');
        });
    }
}

// INIT APP
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// FETCH CONFIG & HANDLE ERRORS
async function initApp() {
    initBgCanvas();
    initSpotlight();
    initRgbLedCycle();

    currentLang = getInitialLanguage();
    document.documentElement.lang = currentLang;
    renderLanguageSwitcher();

    try {
        const response = await fetch('config.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText || 'File not found'}`);
        }
        appConfigData = await response.json();
        lastAppError = null;
        renderAll(appConfigData);
    } catch (error) {
        console.error('Failed to load configuration file:', error);
        lastAppError = error;
        showWebError(error);
    }
}

// DISPLAY ERROR ON WEBPAGE
function showWebError(error) {
    lastAppError = error;
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
            retryBtn.addEventListener('click', () => {
                initApp();
            });
        }
    }
}

// BACKGROUND CANVAS PARTICLES
function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 22), 50);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.8 + 1,
            alpha: Math.random() * 0.4 + 0.1
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

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(148, 163, 184, ${0.12 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.8;
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

// AUTOMATIC RGB LED COLOR CYCLE
function initRgbLedCycle() {
    let hue = 160;
    function step() {
        hue = (hue + 0.3) % 360;
        const mainColor = `hsl(${hue}, 78%, 52%)`;
        const lightColor = `hsl(${hue}, 86%, 66%)`;
        const glowColor = `hsla(${hue}, 78%, 52%, 0.35)`;

        document.documentElement.style.setProperty('--accent-color', mainColor);
        document.documentElement.style.setProperty('--accent-light', lightColor);
        document.documentElement.style.setProperty('--accent-glow', glowColor);

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// RENDER ALL SECTIONS
function renderAll(data) {
    if (!data) return;

    // Support both inline bilingual structure and legacy separate vi/en trees
    const isLegacyBranch = data.vi && data.en && !data.personal;
    const activeData = isLegacyBranch ? (data[currentLang] || data.vi) : data;
    const ui = activeData.ui || {};

    renderMeta(activeData.meta);
    renderProfile(activeData.personal, ui);
    renderStats(activeData.stats, ui);
    renderSkills(activeData.skills, ui);
    renderProjects(activeData.projects, ui);
    renderFooter({
        socials: data.socials || (data.common && data.common.socials) || [],
        footer: activeData.footer,
        ui: ui
    });
}

// META INFO
function renderMeta(meta) {
    if (!meta) return;
    const pageTitle = getText(meta.title, currentLang);
    if (pageTitle) document.title = pageTitle;

    const descTag = document.querySelector('meta[name="description"]');
    const desc = getText(meta.description, currentLang);
    if (descTag && desc) {
        descTag.setAttribute('content', desc);
    }

    const faviconTag = document.getElementById('favicon-link');
    if (faviconTag && meta.favicon) {
        faviconTag.setAttribute('href', meta.favicon);
    }
}

// HEADER INFO
function renderProfile(personal, ui) {
    const profileCard = document.getElementById('profile-card');
    if (!profileCard || !personal) return;
    ui = ui || {};

    const avatarSrc = personal.avatar || 'avatar.jpg';
    const rawStatus = personal.status !== undefined ? personal.status : ui.statusDefault;
    const statusText = getText(rawStatus, currentLang) || 'Available';
    let statusClass = 'other';
    const lowerStatus = statusText.toLowerCase();

    if (lowerStatus.includes('available')) {
        statusClass = 'available';
    } else if (lowerStatus.includes('busy')) {
        statusClass = 'busy';
    } else {
        statusClass = 'other';
    }

    const name = getText(personal.name, currentLang);
    const title = getText(personal.title, currentLang);
    const gender = getText(personal.gender, currentLang);
    const location = getText(personal.location, currentLang);
    const hometown = getText(personal.hometown, currentLang);
    const bio = getText(personal.bio, currentLang);
    const hoverText = getText(ui.statusHover, currentLang) || (currentLang === 'vi' ? 'Liên Hệ Ngay' : 'Contact Now');
    const livesInText = getText(ui.livesIn, currentLang) || (currentLang === 'vi' ? 'Sống tại' : 'Based in');
    const hometownText = getText(ui.hometown, currentLang) || (currentLang === 'vi' ? 'Quê quán' : 'Hometown');
    const resumeText = getText(ui.viewResume, currentLang) || (currentLang === 'vi' ? 'Xem CV / Resume' : 'View CV / Resume');

    profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-wrapper">
                <img src="${avatarSrc}" alt="${name || 'Avatar'}" class="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'NTC')}&background=1e293b&color=34d399'">
            </div>
            <div class="profile-info">
                <div class="profile-top-row">
                    <h1 class="profile-name">${name || ''}</h1>
                    <a href="#footer-section" class="status-pulse-wrapper ${statusClass}" id="btn-status-contact">
                        <span class="status-pulse">
                            <span class="dot-core"></span>
                            <span class="dot-ring"></span>
                        </span>
                        <span class="status-text-default" id="status-text-target">${statusText}</span>
                        <span class="status-text-hover">${hoverText}</span>
                    </a>
                </div>
                
                <div class="profile-title">
                    <i class="fas fa-code"></i> ${title || ''}
                </div>
                
                <div class="profile-details-grid">
                    ${gender || personal.birthYear ? `
                        <span class="detail-item">
                            <i class="fas fa-user"></i> 
                            ${gender || ''}${gender && personal.birthYear ? ' • ' : ''}${personal.birthYear || ''}
                        </span>
                    ` : ''}
                    ${location ? `<span class="detail-item"><i class="fas fa-location-dot"></i> ${livesInText}: ${location}</span>` : ''}
                    ${hometown ? `<span class="detail-item"><i class="fas fa-house"></i> ${hometownText}: ${hometown}</span>` : ''}
                </div>

                <p class="profile-bio">${bio || ''}</p>

                ${personal.resumeUrl && personal.resumeUrl !== '#' ? `
                    <div class="profile-actions">
                        <a href="${personal.resumeUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                            <i class="fas fa-file-pdf"></i> ${resumeText}
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    const statusBtn = document.getElementById('btn-status-contact');
    if (statusBtn) {
        statusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const footerSection = document.getElementById('footer-section');
            if (footerSection) {
                footerSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    footerSection.classList.add('contact-card-highlight');
                    setTimeout(() => {
                        footerSection.classList.remove('contact-card-highlight');
                    }, 2200);

                    const socialBtns = footerSection.querySelectorAll('.social-btn');
                    socialBtns.forEach((btn, index) => {
                        btn.style.animation = 'none';
                        void btn.offsetWidth;
                        btn.style.animation = `socialBounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.12}s forwards`;
                    });
                }, 480);
            }
        });
    }
}

// STATS & ANIMATED COUNTERS
function renderStats(stats, ui) {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;
    if (!Array.isArray(stats) || stats.length === 0) {
        statsSection.style.display = 'none';
        return;
    }
    statsSection.style.display = '';
    ui = ui || {};

    const statsTitle = getText(ui.statsTitle, currentLang) || (currentLang === 'vi' ? 'Thống Kê Nổi Bật' : 'Key Highlights');

    const statsHtml = stats.map(s => `
        <div class="stat-item">
            <div class="stat-num" data-target="${s.num}">${s.num}</div>
            <div class="stat-label">${getText(s.label, currentLang)}</div>
        </div>
    `).join('');

    statsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-chart-simple"></i> ${statsTitle}
            </div>
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

// SKILLS
function renderSkills(skills, ui) {
    const skillsSection = document.getElementById('skills-section');
    if (!skillsSection) return;
    if (!Array.isArray(skills) || skills.length === 0) {
        skillsSection.style.display = 'none';
        return;
    }
    skillsSection.style.display = '';
    ui = ui || {};

    const skillsTitle = getText(ui.skillsTitle, currentLang) || (currentLang === 'vi' ? 'Kỹ Năng & Công Nghệ' : 'Skills & Technologies');

    const categoriesHtml = skills.map(cat => `
        <div class="skill-category">
            <div class="skill-category-title">
                <i class="${cat.icon || 'fas fa-code'}"></i> ${getText(cat.category, currentLang)}
            </div>
            <div class="skill-tags">
                ${(cat.items || []).map(item => `
                    <span class="skill-tag">
                        <i class="${item.icon || 'fas fa-check'}"></i> ${getText(item.name, currentLang)}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');

    skillsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-code"></i> ${skillsTitle}
            </div>
        </div>
        <div class="skills-container">
            ${categoriesHtml}
        </div>
    `;
}

// PROJECTS
function renderProjects(projects, ui) {
    const projectsSection = document.getElementById('projects-section');
    if (!projectsSection) return;
    if (!Array.isArray(projects) || projects.length === 0) {
        projectsSection.style.display = 'none';
        return;
    }
    projectsSection.style.display = '';
    ui = ui || {};

    const projectsTitle = getText(ui.projectsTitle, currentLang) || (currentLang === 'vi' ? 'Dự Án Nổi Bật' : 'Featured Projects');

    const projectsHtml = projects.map(proj => {
        const linksHtml = (proj.links || []).map(link => {
            const rawLabel = link.label || link.name || (link.type === 'github' ? 'GitHub' : (link.type === 'demo' ? 'Live Demo' : 'Link'));
            const label = getText(rawLabel, currentLang);
            return `
                <a href="${link.url}" target="_blank" rel="noopener" class="project-link" title="${label}" aria-label="${label}">
                    <i class="${link.icon || 'fas fa-external-link-alt'}"></i>
                    <span class="project-link-label">${label}</span>
                    <i class="fas fa-arrow-up-right-from-square link-arrow"></i>
                </a>
            `;
        }).join('');

        const techHtml = (proj.tech || []).map(t => `
            <span class="tech-tag">${getText(t, currentLang)}</span>
        `).join('');

        const projTitle = getText(proj.title, currentLang);
        const projDesc = getText(proj.description, currentLang);

        return `
            <div class="project-item">
                <div class="project-header">
                    <div class="project-title" style="color: ${proj.iconColor || 'var(--text-primary)'}">
                        <i class="${proj.icon || 'fas fa-folder'}"></i>
                        ${projTitle}
                    </div>
                    <div class="project-links">
                        ${linksHtml}
                    </div>
                </div>
                <p class="project-desc">${projDesc}</p>
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
        </div>
        <div class="projects-list">
            ${projectsHtml}
        </div>
    `;
}

// FOOTER & SOCIALS DOCK
function renderFooter(data) {
    const footerSection = document.getElementById('footer-section');
    if (!footerSection || !data) return;

    const socials = data.socials || [];
    const footerInfo = data.footer || {};
    const ui = data.ui || {};
    const currentYear = new Date().getFullYear();

    const contactTitle = getText(ui.contactTitle, currentLang) || (currentLang === 'vi' ? 'Liên Hệ & Mạng Xã Hội' : 'Contact & Socials');
    const slogan = getText(footerInfo.slogan, currentLang);
    const author = getText(footerInfo.author, currentLang);

    const socialsHtml = socials.map(soc => {
        const isMailto = (soc.url || '').startsWith('mailto:');
        const targetAttr = isMailto ? '' : 'target="_blank" rel="noopener"';
        const socName = getText(soc.name, currentLang);
        return `
            <a href="${soc.url}" ${targetAttr} class="social-btn" aria-label="${socName || 'Social link'}">
                <i class="${soc.icon}"></i>
            </a>
        `;
    }).join('');

    footerSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-paper-plane"></i> ${contactTitle}
            </div>
        </div>
        <div class="socials-dock-wrapper">
            <div class="socials-dock">
                ${socialsHtml}
            </div>
        </div>
        <div class="footer-info">
            ${slogan ? `<div class="footer-slogan">"${slogan}"</div>` : ''}
            <div class="footer-author">© ${currentYear} ${author}</div>
        </div>
    `;
}

// PREVENT COPY & TEXT SELECTION
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
