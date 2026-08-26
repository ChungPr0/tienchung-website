// INIT APP
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// FETCH CONFIG & HANDLE ERRORS
async function initApp() {
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

// RENDER ALL SECTIONS
function renderAll(data) {
    if (!data) return;
    if (data.meta) renderMeta(data.meta);
    if (data.personal) renderProfile(data.personal);
    if (data.stats) renderStats(data.stats);
    if (data.skills) renderSkills(data.skills);
    if (data.projects) renderProjects(data.projects);
    renderFooter(data);
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

    const avatarSrc = personal.avatar || 'avatar.png';
    const status = personal.status === 'Busy' ? 'Busy' : 'Available';
    const statusClass = status === 'Busy' ? 'busy' : 'available';

    profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-wrapper">
                <img src="${avatarSrc}" alt="${personal.name || 'Avatar'}" class="profile-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(personal.name || 'NTC')}&background=222225&color=fff'">
            </div>
            <div class="profile-info">
                <div class="profile-top-row">
                    <h1 class="profile-name">${personal.name || ''}</h1>
                    <a href="#footer-section" class="status-pulse-wrapper ${statusClass}">
                        <span class="status-pulse">
                            <span class="dot-core"></span>
                            <span class="dot-ring"></span>
                        </span>
                        <span class="status-text-default">${status}</span>
                        <span class="status-text-hover">Liên Hệ Ngay</span>
                    </a>
                </div>
                
                <div class="profile-title">${personal.title || ''}</div>
                
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
                        <a href="${personal.resumeUrl}" target="_blank" rel="noopener" class="btn">
                            <i class="fas fa-file-pdf"></i> Xem CV
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// STATS
function renderStats(stats) {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;
    if (!Array.isArray(stats) || stats.length === 0) {
        statsSection.style.display = 'none';
        return;
    }

    const statsHtml = stats.map(s => `
        <div class="stat-item">
            <div class="stat-num">${s.num}</div>
            <div class="stat-label">${s.label}</div>
        </div>
    `).join('');

    statsSection.innerHTML = `
        <div class="section-title">
            <i class="fas fa-chart-simple"></i> Thống Kê Nổi Bật
        </div>
        <div class="stats-grid">
            ${statsHtml}
        </div>
    `;
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
                    <span class="skill-tag ${item.featured ? 'featured' : ''}">
                        <i class="${item.icon || 'fas fa-check'}"></i> ${item.name}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');

    skillsSection.innerHTML = `
        <div class="section-title">
            <i class="fas fa-code"></i> Kỹ Năng & Công Nghệ
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
            <a href="${link.url}" target="_blank" rel="noopener" class="project-link" title="${link.type || 'Link'}">
                <i class="${link.icon || 'fas fa-external-link-alt'}"></i>
            </a>
        `).join('');

        const techHtml = (proj.tech || []).map(t => `
            <span class="tech-tag">${t}</span>
        `).join('');

        return `
            <div class="project-item">
                <div class="project-header">
                    <div class="project-title">
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
            <i class="fas fa-layer-group"></i> Dự Án Nổi Bật
        </div>
        <div class="projects-list">
            ${projectsHtml}
        </div>
    `;
}

// FOOTER & SOCIALS
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
                <span class="social-tooltip">${soc.name}</span>
            </a>
        `;
    }).join('');

    footerSection.innerHTML = `
        <div class="section-title">
            <i class="fas fa-paper-plane"></i> Liên Hệ & Mạng Xã Hội
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
