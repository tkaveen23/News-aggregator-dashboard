// Global Dashboard State
let articles = [];
let filteredArticles = [];
let activeCategory = "all";
let activeSource = "all";
let activeSearch = "";
let activeSort = "importance";
let activeLanguage = "English";

// DOM Elements
const newsGrid = document.getElementById("newsGrid");
const skeletonGrid = document.getElementById("skeletonGrid");
const emptyState = document.getElementById("emptyState");
const articleCount = document.getElementById("articleCount");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sourceFilter = document.getElementById("sourceFilter");
const sortOrder = document.getElementById("sortOrder");
const categoryTabs = document.getElementById("categoryTabs");
const currentDateSpan = document.getElementById("currentDate");
const themeToggle = document.getElementById("themeToggle");
const topProgressBar = document.getElementById("topProgressBar");
const activeFiltersRow = document.getElementById("activeFiltersRow");
const activeBadgesContainer = document.getElementById("activeBadgesContainer");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const emptyStateResetBtn = document.getElementById("emptyStateResetBtn");
const languageNav = document.querySelector(".language-nav");

// Category style mapping
const CATEGORY_CLASSES = {
    "Economy & Finance": "cat-economy",
    "Politics & Governance": "cat-politics",
    "Weather & Disaster": "cat-weather",
    "Sports": "cat-sports",
    "Law & Crime": "cat-law",
    "Health & Social": "cat-health",
    "General News": "cat-general"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setCurrentDate();
    fetchNewsData();
    setupEventListeners();
});

// Set current formatted date in header
function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDateSpan.textContent = today.toLocaleDateString('en-US', options);
}

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
}

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

// Fetch data from output/dashboard_data.json
async function fetchNewsData() {
    updateProgress(30);
    try {
        const response = await fetch("output/dashboard_data.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        updateProgress(70);
        articles = await response.json();
        
        // Setup source filter dropdown options
        populateSourcesDropdown();
        
        updateProgress(100);
        setTimeout(() => {
            skeletonGrid.style.display = "none";
            applyFiltersAndRender();
        }, 300);
        
    } catch (error) {
        console.error("Error fetching news dashboard data:", error);
        skeletonGrid.style.display = "none";
        emptyState.style.display = "flex";
        emptyState.querySelector("h3").textContent = "Failed to load dashboard data";
        emptyState.querySelector("p").textContent = "Please make sure you have run the categorization script 'python categorize_news.py' first.";
        emptyStateResetBtn.style.display = "none";
        updateProgress(0);
    }
}

// Progress Bar Helper
function updateProgress(percentage) {
    topProgressBar.style.width = `${percentage}%`;
    if (percentage === 100) {
        setTimeout(() => {
            topProgressBar.style.width = "0%";
        }, 800);
    }
}

// Populate Sources Dropdown
function populateSourcesDropdown() {
    const sourcesSet = new Set();
    articles.forEach(art => {
        if (art.source) sourcesSet.add(art.source);
    });
    
    // Sort sources alphabetically
    const sortedSources = Array.from(sourcesSet).sort();
    
    // Clear and reset source options
    sourceFilter.innerHTML = '<option value="all">All Sources</option>';
    
    sortedSources.forEach(source => {
        const option = document.createElement("option");
        option.value = source;
        option.textContent = source;
        sourceFilter.appendChild(option);
    });
}

// Event Listeners
function setupEventListeners() {
    // Search listener
    searchInput.addEventListener("input", (e) => {
        activeSearch = e.target.value.trim().toLowerCase();
        clearSearchBtn.style.display = activeSearch.length > 0 ? "block" : "none";
        applyFiltersAndRender();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        activeSearch = "";
        clearSearchBtn.style.display = "none";
        applyFiltersAndRender();
    });

    // Source Filter
    sourceFilter.addEventListener("change", (e) => {
        activeSource = e.target.value;
        applyFiltersAndRender();
    });

    // Sort Filter
    sortOrder.addEventListener("change", (e) => {
        activeSort = e.target.value;
        applyFiltersAndRender();
    });

    // Category Tabs
    categoryTabs.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-btn");
        if (!btn) return;
        
        // Remove active class from all tabs
        categoryTabs.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
        
        // Add active class to clicked tab
        btn.classList.add("active");
        
        activeCategory = btn.getAttribute("data-category");
        applyFiltersAndRender();
    });

    // Language Switcher
    languageNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".lang-btn");
        if (!btn) return;
        languageNav.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeLanguage = btn.getAttribute("data-lang");
        applyFiltersAndRender();
    });

    // Reset buttons
    resetFiltersBtn.addEventListener("click", resetFilters);
    emptyStateResetBtn.addEventListener("click", resetFilters);
}

function resetFilters() {
    // Reset global state variables
    activeCategory = "all";
    activeSource = "all";
    activeSearch = "";
    activeSort = "importance";
    activeLanguage = "English";
    
    // Reset UI inputs
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    sourceFilter.value = "all";
    sortOrder.value = "importance";
    
    // Reset language buttons
    languageNav.querySelectorAll(".lang-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-lang") === "English");
    });
    
    // Reset Category Tabs
    categoryTabs.querySelectorAll(".tab-btn").forEach(t => {
        if (t.getAttribute("data-category") === "all") {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });
    
    applyFiltersAndRender();
}

// Main Filter & Render Logic
function applyFiltersAndRender() {
    filteredArticles = articles.filter(art => {
        // 1. Category Filter
        const matchesCategory = activeCategory === "all" || art.category === activeCategory;
        
        // 2. Source Filter
        const matchesSource = activeSource === "all" || art.source === activeSource;
        
        // 3. Language Filter
        const matchesLanguage = activeLanguage === "all" || art.language === activeLanguage;
        
        // 4. Search Filter
        let matchesSearch = true;
        if (activeSearch) {
            const title = (art.title || "").toLowerCase();
            const desc = (art.description || art.summary || "").toLowerCase();
            const tags = (art.tags || []).join(" ").toLowerCase();
            const originalTitle = (art.original_title || "").toLowerCase();
            const source = (art.source || "").toLowerCase();
            
            matchesSearch = title.includes(activeSearch) || 
                            desc.includes(activeSearch) || 
                            tags.includes(activeSearch) ||
                            originalTitle.includes(activeSearch) ||
                            source.includes(activeSearch);
        }
        
        return matchesCategory && matchesSource && matchesLanguage && matchesSearch;
    });

    // Sort logic
    filteredArticles.sort((a, b) => {
        if (activeSort === "importance") {
            const impA = a.importance || 0;
            const impB = b.importance || 0;
            if (impB !== impA) {
                return impB - impA;
            }
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        }
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return activeSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Render Stats
    articleCount.textContent = filteredArticles.length;
    
    // Render Active Filter Badges
    renderActiveFilterBadges();

    // Render Cards
    renderArticleCards();
}

// Render Filter Badges
function renderActiveFilterBadges() {
    activeBadgesContainer.innerHTML = "";
    let hasFilters = false;

    if (activeCategory !== "all") {
        createBadge("Category: " + activeCategory, () => {
            activeCategory = "all";
            categoryTabs.querySelectorAll(".tab-btn").forEach(t => {
                t.classList.toggle("active", t.getAttribute("data-category") === "all");
            });
            applyFiltersAndRender();
        });
        hasFilters = true;
    }

    if (activeSource !== "all") {
        createBadge("Source: " + activeSource, () => {
            activeSource = "all";
            sourceFilter.value = "all";
            applyFiltersAndRender();
        });
        hasFilters = true;
    }

    if (activeSearch) {
        createBadge('Search: "' + activeSearch + '"', () => {
            activeSearch = "";
            searchInput.value = "";
            clearSearchBtn.style.display = "none";
            applyFiltersAndRender();
        });
        hasFilters = true;
    }

    activeFiltersRow.style.display = hasFilters ? "flex" : "none";
}

function createBadge(text, onRemove) {
    const badge = document.createElement("div");
    badge.className = "filter-badge";
    badge.innerHTML = `
        <span>${text}</span>
        <button><i data-lucide="x"></i></button>
    `;
    badge.querySelector("button").addEventListener("click", onRemove);
    activeBadgesContainer.appendChild(badge);
    lucide.createIcons();
}

// Render dynamic article list cards
function renderArticleCards() {
    // Clear old elements
    newsGrid.innerHTML = "";

    if (filteredArticles.length === 0) {
        newsGrid.style.display = "none";
        emptyState.style.display = "flex";
        return;
    }

    newsGrid.style.display = "grid";
    emptyState.style.display = "none";

    filteredArticles.forEach(art => {
        const card = document.createElement("div");
        card.className = "article-card";
        
        // Format Date
        const rawDate = art.date;
        let formattedDate = "N/A";
        if (rawDate) {
            try {
                const dateObj = new Date(rawDate);
                formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                });
            } catch (e) {
                formattedDate = rawDate;
            }
        }
        
        // Media markup
        let mediaMarkup = "";
        if (art.image_url) {
            mediaMarkup = `<img src="${art.image_url}" alt="${escapeHtml(art.title)}" onerror="this.outerHTML='<div class=\\'media-placeholder\\'><div class=\\'placeholder-pattern\\'></div><i data-lucide=\\'image-off\\'></i>No Preview Image</div>'; lucide.createIcons();">`;
        } else {
            mediaMarkup = `
                <div class="media-placeholder">
                    <div class="placeholder-pattern"></div>
                    <i data-lucide="newspaper"></i>
                    <span>News Article</span>
                </div>
            `;
        }

        // Translation indicator removed as we now display original language

        const summaryText = art.description || art.summary || art.translated_summary_en || "No description available.";
        const displayTitle = art.original_title || art.title;

        card.innerHTML = `
            <div class="card-media">
                ${mediaMarkup}
            </div>
            <div class="card-info-wrapper">
                <div class="card-content">
                    <div class="meta-row">
                        <span class="source-tag">
                            <i data-lucide="newspaper"></i>
                            ${escapeHtml(art.source)}
                        </span>
                        <span class="date-tag">
                            <i data-lucide="calendar"></i>
                            ${formattedDate}
                        </span>
                    </div>
                    <a href="${art.link}" target="_blank" class="card-title" title="${escapeHtml(displayTitle)}">
                        ${escapeHtml(displayTitle)}
                    </a>
                    <p class="card-description">${escapeHtml(summaryText)}</p>
                </div>
                <div class="card-footer">
                    <a href="${art.link}" target="_blank" class="read-article-link">
                        Read Article <i data-lucide="external-link"></i>
                    </a>
                </div>
            </div>
        `;
        
        newsGrid.appendChild(card);
    });

    // Re-trigger Lucide icons render
    lucide.createIcons();
}

// Utility function to escape HTML strings safely
function escapeHtml(text) {
    if (!text) return "";
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
