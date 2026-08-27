// INIT APP
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// FETCH CONFIG & HANDLE ERRORS
async function initApp() {
    initBgCanvas();
    initSpotlight();
    initRgbLedCycle();

    try {
        const response = await fetch('config.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText || 'File not found'}`);
        }
        const data = await response.json();
        renderAll(data);
    } catch (error) {
        console.error('Failed to load configuration file:', error);
        showWebError(error);
    }
}

// DISPLAY ERROR ON WEBPAGE
function showWebError(error) {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <h2 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle"></i> System Maintenance
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 8px;">
                    Unable to load configuration file.
                </p>
                <small style="color: var(--text-muted); font-family: var(--font-mono);">
                    Details: ${error.message}
                </small>
            </div>
        `;
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
    if (data.meta) renderMeta(data.meta);
    if (data.personal) renderProfile(data.personal);
    if (data.stats) renderStats(data.stats);
    if (data.skills) renderSkills(data.skills);
    if (data.projects) renderProjects(data.projects);
    renderFooter(data);

    runTerminalConsole(data);
}

// INTERACTIVE TERMINAL CONSOLE & SEQUENTIAL AUTO-SCROLL LOAD
async function runTerminalConsole(data) {
    const termSection = document.getElementById('terminal-section');
    if (!termSection) return;

    const personal = data.personal || {};

    const profileCard = document.getElementById('profile-card');
    const statsSection = document.getElementById('stats-section');
    const skillsSection = document.getElementById('skills-section');
    const projectsSection = document.getElementById('projects-section');
    const footerSection = document.getElementById('footer-section');

    const sectionsToReveal = [profileCard, statsSection, skillsSection, projectsSection, footerSection];

    sectionsToReveal.forEach(sec => {
        if (sec) {
            sec.style.opacity = '0';
            sec.style.transform = 'translateY(24px)';
            sec.style.pointerEvents = 'none';
            sec.style.transition = 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
        }
    });

    termSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-terminal"></i> Console
            </div>
        </div>
        <div class="terminal-window">
            <div class="terminal-header">
                <div class="terminal-dots">
                    <span class="terminal-dot red"></span>
                    <span class="terminal-dot yellow"></span>
                    <span class="terminal-dot green"></span>
                </div>
                <div class="terminal-title-text"><i class="fas fa-code"></i> tienchung-vps:~$</div>
            </div>
            <div class="terminal-body">
                <pre class="term-code" id="term-code-display"></pre>
            </div>
        </div>
    `;

    const codeDisplay = document.getElementById('term-code-display');
    if (!codeDisplay) return;

    const statusText = personal.status || 'Available';

    const consoleSteps = [
        { text: "$ systemctl start tienchung-portfolio.service\n", speed: 35, pauseAfter: 400 },
        { text: "[OK] Initializing system shell environment...\n", speed: 25, pauseAfter: 500 },
        { text: `[OK] Loading profile: ${personal.name || 'Nguyễn Tiến Chung'}...\n`, speed: 28, reveal: profileCard, scrollTarget: profileCard, pauseAfter: 900 },
        { text: `[OK] Loading status: [${statusText}]...\n`, speed: 28, updateStatus: true, pauseAfter: 700 },
        { text: "[OK] Loading stats & metrics...\n", speed: 25, reveal: statsSection, scrollTarget: statsSection, pauseAfter: 900 },
        { text: "[OK] Loading skills & technologies...\n", speed: 25, reveal: skillsSection, scrollTarget: skillsSection, pauseAfter: 900 },
        { text: "[OK] Loading featured projects...\n", speed: 25, reveal: projectsSection, scrollTarget: projectsSection, pauseAfter: 900 },
        { text: "[OK] Loading contact info & socials...\n", speed: 25, reveal: footerSection, scrollTarget: footerSection, pauseAfter: 900 },
        { text: "[OK] System status: 200 OK - All services operational. DONE.\n", speed: 22, pauseAfter: 1000 }
    ];

    let currentLog = "";

    for (const step of consoleSteps) {
        for (let i = 0; i < step.text.length; i++) {
            currentLog += step.text[i];
            codeDisplay.innerHTML = formatConsoleOutput(currentLog) + `<span class="cursor-blink"></span>`;
            await new Promise(r => setTimeout(r, step.speed));
        }

        if (step.reveal) {
            step.reveal.style.opacity = '1';
            step.reveal.style.transform = 'translateY(0)';
            step.reveal.style.pointerEvents = 'auto';
        }

        if (step.updateStatus) {
            activateProfileStatus();
        }

        if (step.scrollTarget) {
            step.scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (step.pauseAfter) {
            await new Promise(r => setTimeout(r, step.pauseAfter));
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ACTIVATE REAL PROFILE STATUS ON CONSOLE STEP
function activateProfileStatus() {
    const statusBtn = document.getElementById('btn-status-contact');
    const statusTextTarget = document.getElementById('status-text-target');
    if (!statusBtn || !statusTextTarget) return;

    const targetStatus = statusBtn.dataset.targetStatus || 'Available';
    const targetClass = statusBtn.dataset.targetClass || 'available';

    statusBtn.classList.remove('other');
    statusBtn.classList.add(targetClass);
    statusTextTarget.innerText = targetStatus;

    statusBtn.style.transform = 'scale(1.18)';
    setTimeout(() => {
        statusBtn.style.transform = 'translateY(0) scale(1)';
    }, 280);
}

function formatConsoleOutput(text) {
    return text
        .replace(/\$ (.*)/g, '<span class="str">$ $1</span>')
        .replace(/\[OK\]/g, '<span class="kw">[OK]</span>')
        .replace(/DONE\./g, '<span class="str">DONE.</span>');
}

// META INFO
function renderMeta(meta) {
    if (!meta) return;
    if (meta.title) document.title = meta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag && meta.description) {
        descTag.setAttribute('content', meta.description);
    }

    const faviconTag = document.getElementById('favicon-link');
    if (faviconTag && meta.favicon) {
        faviconTag.setAttribute('href', meta.favicon);
    }
}

// HEADER INFO
function renderProfile(personal) {
    const profileCard = document.getElementById('profile-card');
    if (!profileCard || !personal) return;

    const avatarSrc = personal.avatar || 'avatar.jpg';
    const statusText = personal.status || 'Available';
    let statusClass = 'other';
    const lowerStatus = statusText.toLowerCase();

    if (lowerStatus === 'available') {
        statusClass = 'available';
    } else if (lowerStatus === 'busy') {
        statusClass = 'busy';
    } else {
        statusClass = 'other';
    }

    profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-wrapper">
                <img src="${avatarSrc}" alt="${personal.name || 'Avatar'}" class="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(personal.name || 'NTC')}&background=1e293b&color=34d399'">
            </div>
            <div class="profile-info">
                <div class="profile-top-row">
                    <h1 class="profile-name">${personal.name || ''}</h1>
                    <a href="#footer-section" class="status-pulse-wrapper other" id="btn-status-contact" data-target-status="${statusText}" data-target-class="${statusClass}">
                        <span class="status-pulse">
                            <span class="dot-core"></span>
                            <span class="dot-ring"></span>
                        </span>
                        <span class="status-text-default" id="status-text-target">Connecting...</span>
                        <span class="status-text-hover">Liên Hệ Ngay</span>
                    </a>
                </div>
                
                <div class="profile-title">
                    <i class="fas fa-terminal"></i> ${personal.title || ''}
                </div>
                
                <div class="profile-details-grid">
                    ${personal.gender || personal.birthYear ? `
                        <span class="detail-item">
                            <i class="fas fa-user"></i> 
                            ${personal.gender || ''}${personal.gender && personal.birthYear ? ' • ' : ''}${personal.birthYear || ''}
                        </span>
                    ` : ''}
                    ${personal.location ? `<span class="detail-item"><i class="fas fa-location-dot"></i> Sống tại: ${personal.location}</span>` : ''}
                    ${personal.hometown ? `<span class="detail-item"><i class="fas fa-house"></i> Quê quán: ${personal.hometown}</span>` : ''}
                </div>

                <p class="profile-bio">${personal.bio || ''}</p>

                ${personal.resumeUrl && personal.resumeUrl !== '#' ? `
                    <div class="profile-actions">
                        <a href="${personal.resumeUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                            <i class="fas fa-file-pdf"></i> Xem CV / Resume
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
function renderStats(stats) {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;
    if (!Array.isArray(stats) || stats.length === 0) {
        statsSection.style.display = 'none';
        return;
    }

    const statsHtml = stats.map(s => `
        <div class="stat-item">
            <div class="stat-num" data-target="${s.num}">${s.num}</div>
            <div class="stat-label">${s.label}</div>
        </div>
    `).join('');

    statsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-chart-simple"></i> Thống Kê Nổi Bật
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
function renderSkills(skills) {
    const skillsSection = document.getElementById('skills-section');
    if (!skillsSection) return;
    if (!Array.isArray(skills) || skills.length === 0) {
        skillsSection.style.display = 'none';
        return;
    }

    const categoriesHtml = skills.map(cat => `
        <div class="skill-category">
            <div class="skill-category-title">
                <i class="${cat.icon || 'fas fa-code'}"></i> ${cat.category}
            </div>
            <div class="skill-tags">
                ${(cat.items).map(item => `
                    <span class="skill-tag">
                        <i class="${item.icon || 'fas fa-check'}"></i> ${item.name}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');

    skillsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-code"></i> Kỹ Năng & Công Nghệ
            </div>
        </div>
        <div class="skills-container">
            ${categoriesHtml}
        </div>
    `;
}

// PROJECTS
function renderProjects(projects) {
    const projectsSection = document.getElementById('projects-section');
    if (!projectsSection) return;
    if (!Array.isArray(projects) || projects.length === 0) {
        projectsSection.style.display = 'none';
        return;
    }

    const projectsHtml = projects.map(proj => {
        const linksHtml = (proj.links || []).map(link => `
            <a href="${link.url}" target="_blank" rel="noopener" class="project-link">
                <i class="${link.icon || 'fas fa-external-link-alt'}"></i>
            </a>
        `).join('');

        const techHtml = (proj.tech || []).map(t => `
            <span class="tech-tag">${t}</span>
        `).join('');

        return `
            <div class="project-item">
                <div class="project-header">
                    <div class="project-title" style="color: ${proj.iconColor || 'var(--text-primary)'}">
                        <i class="${proj.icon || 'fas fa-folder'}"></i>
                        ${proj.title}
                    </div>
                    <div class="project-links">
                        ${linksHtml}
                    </div>
                </div>
                <p class="project-desc">${proj.description}</p>
                <div class="project-tech-list">
                    ${techHtml}
                </div>
            </div>
        `;
    }).join('');

    projectsSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-layer-group"></i> Dự Án Nổi Bật
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
    const currentYear = new Date().getFullYear();

    const socialsHtml = socials.map(soc => {
        const isMailto = (soc.url || '').startsWith('mailto:');
        const targetAttr = isMailto ? '' : 'target="_blank" rel="noopener"';
        return `
            <a href="${soc.url}" ${targetAttr} class="social-btn">
                <i class="${soc.icon}"></i>
            </a>
        `;
    }).join('');

    footerSection.innerHTML = `
        <div class="section-title">
            <div class="title-left">
                <i class="fas fa-paper-plane"></i> Liên Hệ & Mạng Xã Hội
            </div>
        </div>
        <div class="socials-dock-wrapper">
            <div class="socials-dock">
                ${socialsHtml}
            </div>
        </div>
        <div class="footer-info">
            ${footerInfo.slogan ? `<div class="footer-slogan">"${footerInfo.slogan}"</div>` : ''}
            <div class="footer-author">© ${currentYear} ${footerInfo.author}</div>
        </div>
    `;
}

// PREVENT COPY & TEXT SELECTION
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
