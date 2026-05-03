
const STORAGE_KEY = 'janvaani_complaints';

// Default seed data for Nallasopara, Virar, Vasai
function getDefaultComplaints() {
    return [
        // Nallasopara complaints (High - 78% density)
        { id: 1, city: 'Nallasopara', category: 'Road Damage', description: 'Potholes on main road', status: 'pending', date: '2026-03-15' },
        { id: 2, city: 'Nallasopara', category: 'Water Supply', description: 'Irregular water supply in East area', status: 'pending', date: '2026-03-20' },
        { id: 3, city: 'Nallasopara', category: 'Drainage', description: 'Clogged drains causing overflow', status: 'resolved', date: '2026-02-10' },
        { id: 4, city: 'Nallasopara', category: 'Street Light', description: 'Non-functional street lights', status: 'pending', date: '2026-04-01' },
        { id: 5, city: 'Nallasopara', category: 'Garbage', description: 'Uncollected garbage for 1 week', status: 'pending', date: '2026-04-08' },
        { id: 6, city: 'Virar', category: 'Road Damage', description: 'Cracked footpath near station', status: 'resolved', date: '2026-01-25' },
        { id: 7, city: 'Virar', category: 'Noise Pollution', description: 'Loud construction at night', status: 'pending', date: '2026-03-30' },
        { id: 8, city: 'Virar', category: 'Water Supply', description: 'Low water pressure', status: 'resolved', date: '2026-02-18' },
        { id: 9, city: 'Vasai', category: 'Park Maintenance', description: 'Overgrown grass in public park', status: 'resolved', date: '2026-01-10' },
        { id: 10, city: 'Vasai', category: 'Street Light', description: 'Flickering light on main road', status: 'resolved', date: '2026-03-05' },
    ];
}

function loadComplaints() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch(e) { return getDefaultComplaints(); }
    }
    // First time: seed data
    const defaults = getDefaultComplaints();
    saveComplaints(defaults);
    return defaults;
}

function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

let complaints = loadComplaints();

// --- Get Stats by City ---
function getCityStats(cityName) {
    const cityComplaints = complaints.filter(c => c.city === cityName);
    const total = cityComplaints.length;
    const resolved = cityComplaints.filter(c => c.status === 'resolved').length;
    const pending = total - resolved;
    return { total, resolved, pending };
}

function getTotalStats() {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = total - resolved;
    return { total, resolved, pending };
}

// --- Determine Density Level ---
function getDensityLevel(total) {
    // Relative thresholds based on our data range
    if (total >= 350) return 'high';
    if (total >= 200) return 'medium';
    return 'low';
}

function getDensityPercentage(total) {
    const maxPossible = 500; // reference max
    return Math.min(Math.round((total / maxPossible) * 100), 100);
}

// --- Update Homepage Stats ---
function updateHomepageStats() {
    const totalStats = getTotalStats();
    const nStats = getCityStats('Nallasopara');
    const vStats = getCityStats('Virar');
    const vaStats = getCityStats('Vasai');

    // Update hero numbers
    const totalEl = document.getElementById('totalComplaints');
    const resolvedEl = document.getElementById('resolvedCount');
    const pendingEl = document.getElementById('pendingCount');
    if (totalEl) totalEl.textContent = totalStats.total.toLocaleString();
    if (resolvedEl) resolvedEl.textContent = totalStats.resolved.toLocaleString();
    if (pendingEl) pendingEl.textContent = totalStats.pending.toLocaleString();

    // Update city cards
    updateCityCard('nallasopara', nStats);
    updateCityCard('virar', vStats);
    updateCityCard('vasai', vaStats);
}

function updateCityCard(prefix, stats) {
    const density = getDensityLevel(stats.total);
    const percentage = getDensityPercentage(stats.total);

    const densityEl = document.getElementById(prefix + 'Density');
    const barEl = document.getElementById(prefix + 'Bar');
    const totalEl = document.getElementById(prefix + 'Total');
    const resolvedEl = document.getElementById(prefix + 'Resolved');
    const pendingEl = document.getElementById(prefix + 'Pending');

    if (densityEl) {
        densityEl.textContent = density === 'high' ? 'High Density' : density === 'medium' ? 'Medium Density' : 'Low Density';
        densityEl.className = 'density-badge ' + density + '-density';
    }
    if (barEl) {
        barEl.style.width = percentage + '%';
        barEl.className = 'density-bar ' + density;
    }
    if (totalEl) totalEl.textContent = stats.total;
    if (resolvedEl) resolvedEl.textContent = stats.resolved;
    if (pendingEl) pendingEl.textContent = stats.pending;
}

// --- Handle Complaint Submission ---
function handleComplaintSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const newComplaint = {
        id: Date.now(),
        city: form.city.value,
        category: form.category.value,
        description: form.description.value,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
    };

    complaints.push(newComplaint);
    saveComplaints(complaints);

    // Show success message
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Complaint #${newComplaint.id} filed successfully! Authorities in <strong>${newComplaint.city}</strong> have been notified.`;
    }

    form.reset();
    updateHomepageStats();

    // Hide success after 5 seconds
    setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
    }, 5000);

    return false;
}

// --- Populate Stats Table on stats.html ---
function populateStatsTable() {
    const tableBody = document.getElementById('statsTableBody');
    if (!tableBody) return;

    const cities = ['Nallasopara', 'Virar', 'Vasai'];
    tableBody.innerHTML = '';

    cities.forEach(city => {
        const stats = getCityStats(city);
        const density = getDensityLevel(stats.total);
        const percentage = getDensityPercentage(stats.total);

        const statusClass = density === 'high' ? 'high' : density === 'medium' ? 'medium' : 'low';
        const statusText = density === 'high' ? 'URGENT ATTENTION' : density === 'medium' ? 'MODERATE' : 'WELL MAINTAINED';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${city}</strong></td>
            <td>${stats.total}</td>
            <td>${stats.resolved}</td>
            <td>${stats.pending}</td>
            <td>${percentage}%</td>
            <td><span class="status-dot ${statusClass}"></span> ${statusText}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update heatmap cards
    cities.forEach(city => {
        const stats = getCityStats(city);
        const density = getDensityLevel(stats.total);
        const card = document.getElementById(city.toLowerCase() + 'HeatmapCard');
        if (card) {
            const countEl = card.querySelector('.complaint-count');
            const statusEl = card.querySelector('.status-text');
            if (countEl) countEl.textContent = stats.total;
            if (statusEl) {
                statusEl.textContent = density === 'high' ? '⚠ Urgent' : density === 'medium' ? '⚡ Moderate' : '✅ Low';
            }
        }
    });
}

// --- Mobile Navigation ---
function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
        // Close nav when link clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }
}

// --- Navbar Scroll Effect ---
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --- Initialize Everything ---
function init() {
    updateHomepageStats();
    populateStatsTable();
    setupMobileNav();
    setupNavbarScroll();

    // Attach form submit handler
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Expose for inline use
window.handleComplaintSubmit = handleComplaintSubmit;
