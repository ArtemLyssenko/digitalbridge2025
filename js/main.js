// ===================================
// DIGITAL BRIDGE 2025 - MAIN SCRIPT
// Loads sessions, handles tabs, animations
// ===================================

// ========== THREE.JS PARTICLE BACKGROUND ==========
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 50;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x6cbaff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;
        
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========== GLOBAL STATE ==========
let allSessions = [];
let currentLanguage = 'en'; // default language

// ========== LOCALSTORAGE FILTER STATE ==========
const STORAGE_KEY = 'digitalbridge_filters';

function saveFilterState() {
    const state = {
        day: document.querySelector('.tab-btn.active')?.getAttribute('data-day') || '1',
        hall: document.querySelector('.hall-btn.active')?.getAttribute('data-hall') || 'all',
        language: currentLanguage
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateClearFiltersButtonVisibility();
}

function loadFilterState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function clearFilterState() {
    localStorage.removeItem(STORAGE_KEY);
}

function isDefaultFilterState() {
    const currentDay = document.querySelector('.tab-btn.active')?.getAttribute('data-day') || '1';
    const currentHall = document.querySelector('.hall-btn.active')?.getAttribute('data-hall') || 'all';
    
    return currentDay === '1' && currentHall === 'all' && currentLanguage === 'en';
}

function updateClearFiltersButtonVisibility() {
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (!clearBtn) return;
    
    const isDefault = isDefaultFilterState();
    console.log('Checking filter state - is default?', isDefault, {
        day: document.querySelector('.tab-btn.active')?.getAttribute('data-day'),
        hall: document.querySelector('.hall-btn.active')?.getAttribute('data-hall'),
        language: currentLanguage
    });
    
    if (isDefault) {
        clearBtn.style.display = 'none';
        console.log('Clear button hidden');
    } else {
        clearBtn.style.display = 'block';
        console.log('Clear button visible');
    }
}

// ========== TRANSLATIONS ==========
const translations = {
    en: {
        heroSubtitle: 'Explore three days of innovation and insight',
        day: 'Day',
        allHalls: 'All halls',
        clearFilters: 'Clear Filters',
        dates: {
            1: 'Oct 2',
            2: 'Oct 3',
            3: 'Oct 4'
        },
        halls: {
            'Singularity hall': 'Singularity hall',
            'Unity hall': 'Unity hall',
            'Vision hall': 'Vision hall',
            'Quantum hall': 'Quantum hall',
            'Generative hall': 'Generative hall'
        }
    },
    ru: {
        heroSubtitle: 'Три дня инноваций и идей',
        day: 'День',
        allHalls: 'Все залы',
        clearFilters: 'Очистить фильтры',
        dates: {
            1: '2 окт',
            2: '3 окт',
            3: '4 окт'
        },
        halls: {
            'Singularity hall': 'Зал Singularity',
            'Unity hall': 'Зал Unity',
            'Vision hall': 'Зал Vision',
            'Quantum hall': 'Зал Quantum',
            'Generative hall': 'Зал Generative'
        }
    },
    kz: {
        heroSubtitle: 'Үш күн инновация және идеялар',
        day: 'Күн',
        allHalls: 'Барлық залдар',
        clearFilters: 'Сүзгілерді тазалау',
        dates: {
            1: '2 қаз',
            2: '3 қаз',
            3: '4 қаз'
        },
        halls: {
            'Singularity hall': 'Singularity залы',
            'Unity hall': 'Unity залы',
            'Vision hall': 'Vision залы',
            'Quantum hall': 'Quantum залы',
            'Generative hall': 'Generative залы'
        }
    }
};

// ========== LOAD SESSIONS DATA ==========
function loadSessions() {
    // Load from embedded data (no fetch needed)
    if (typeof DIGITALBRIDGE_SESSIONS !== 'undefined') {
        allSessions = DIGITALBRIDGE_SESSIONS;
        return DIGITALBRIDGE_SESSIONS;
    } else {
        console.error('Sessions data not loaded. Make sure sessions-data.js is included.');
        return [];
    }
}

// ========== RENDER SESSION CARD ==========
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.setAttribute('data-session-id', session.id);
    if (session.hall) card.setAttribute('data-hall', session.hall);
    if (session.language) card.setAttribute('data-language', session.language);
    
    const url = session.fileName ? `html/${session.fileName}` : '#';
    const title = session.session_title || session.title || 'Untitled Session';
    
    card.innerHTML = `
        <a href="${url}" class="session-node">
            <h3 class="session-title">${title}</h3>
        </a>
    `;
    
    return card;
}

// ========== POPULATE TIMELINES ==========
function populateTimelines(sessions) {
    // Filter by current language
    const filteredSessions = sessions.filter(s => s.language === currentLanguage);
    
    // Group sessions by day
    const sessionsByDay = {
        1: filteredSessions.filter(s => s.day === 1),
        2: filteredSessions.filter(s => s.day === 2),
        3: filteredSessions.filter(s => s.day === 3)
    };

    // Populate each day's timeline
    Object.keys(sessionsByDay).forEach(day => {
        const container = document.getElementById(`sessions-day${day}`);
        if (!container) return;

        const daySessions = sessionsByDay[day];
        
        if (daySessions.length === 0) {
            container.innerHTML = '<div class="loading">No sessions scheduled for this day</div>';
            return;
        }

        // Clear loading state
        container.innerHTML = '';

        // Sort by order if available
        daySessions.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Create and append session cards
        daySessions.forEach(session => {
            const card = createSessionCard(session);
            container.appendChild(card);
        });
    });
}

// ========== GSAP ANIMATIONS ==========
function initAnimations() {
    // Register ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Animate hero on load
    gsap.from('.hero-title', {
        duration: 1.2,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Animate initial timeline first (cards appear first)
    setTimeout(() => {
        animateTimelineCards('timeline-day1');
    }, 100);

    // Animate tabs after cards (faster animation)
    gsap.from('.tab-btn', {
        duration: 0.4,
        y: 20,
        opacity: 0,
        stagger: 0.05,
        delay: 0.8,
        ease: 'back.out(1.2)',
        clearProps: 'all'
    });
}

// ========== ANIMATE TIMELINE CARDS ==========
function animateTimelineCards(timelineId) {
    const timeline = document.getElementById(timelineId);
    if (!timeline) return;

    // Ensure timeline is visible
    gsap.set(timeline, { opacity: 1 });

    const cards = timeline.querySelectorAll('.session-card');
    
    gsap.to(cards, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // Add scroll-triggered animations
    if (typeof ScrollTrigger !== 'undefined') {
        cards.forEach(card => {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(card, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: 'back.out(1.7)'
                    });
                }
            });
        });
    }
}

// ========== DAY TAB SWITCHING ==========
function initDayTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const timelines = document.querySelectorAll('.timeline');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetDay = btn.getAttribute('data-day');
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Save state to localStorage
            saveFilterState();

            // Switch timeline with GSAP animation
            timelines.forEach(timeline => {
                if (timeline.id === `timeline-day${targetDay}`) {
                    // Fade out current timeline
                    gsap.to(timelines, {
                        duration: 0.3,
                        opacity: 0,
                        onComplete: () => {
                            // Hide all timelines
                            timelines.forEach(t => {
                                t.classList.remove('active');
                                t.style.display = 'none';
                            });

                            // Show target timeline
                            timeline.style.display = 'block';
                            timeline.classList.add('active');

                            // Fade in with animation
                            gsap.to(timeline, {
                                duration: 0.5,
                                opacity: 1,
                                ease: 'power2.out'
                            });

                            // Animate cards
                            animateTimelineCards(`timeline-day${targetDay}`);
                        }
                    });
                }
            });
        });
    });
}

// ========== HALL FILTERING ==========
function initHallFilters() {
    const filterBar = document.querySelector('.hall-filters');
    if (!filterBar) return;

    filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.hall-btn');
        if (!btn) return;

        // update active state
        Array.from(filterBar.querySelectorAll('.hall-btn')).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const hall = btn.getAttribute('data-hall');
        
        // Save state to localStorage
        saveFilterState();
        
        // Apply hall filter
        applyHallFilter(hall);
    });
}

// ========== UPDATE UI TEXT ==========
function updateUIText() {
    const t = translations[currentLanguage];
    
    // Update hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = t.heroSubtitle;
    }
    
    // Update day tabs
    const dayTabs = document.querySelectorAll('.tab-btn');
    dayTabs.forEach(tab => {
        const day = tab.getAttribute('data-day');
        const dateSpan = tab.querySelector('.tab-date');
        if (dateSpan) {
            tab.childNodes[0].textContent = `${t.day} ${day}`;
            dateSpan.textContent = t.dates[day];
        }
    });
    
    // Update hall filter buttons
    const hallBtns = document.querySelectorAll('.hall-btn');
    hallBtns.forEach(btn => {
        const hall = btn.getAttribute('data-hall');
        if (hall === 'all') {
            btn.textContent = t.allHalls;
        } else if (t.halls[hall]) {
            btn.textContent = t.halls[hall];
        }
    });
    
    // Update clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.textContent = t.clearFilters;
    }
}

// ========== LANGUAGE SWITCHING ==========
function initLanguageSwitch() {
    const languageBtns = document.querySelectorAll('.language-btn');
    
    languageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const language = btn.getAttribute('data-language');
            
            // Update active state
            languageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update current language
            currentLanguage = language;
            
            // Save state to localStorage
            saveFilterState();
            
            // Update UI text
            updateUIText();
            
            // Reload sessions with new language
            if (allSessions.length > 0) {
                populateTimelines(allSessions);
                
                // Restore hall filter from state
                const savedState = loadFilterState();
                if (savedState && savedState.hall) {
                    const hallFilterBar = document.querySelector('.hall-filters');
                    if (hallFilterBar) {
                        const hallBtn = hallFilterBar.querySelector(`[data-hall="${savedState.hall}"]`);
                        if (hallBtn) {
                            Array.from(hallFilterBar.querySelectorAll('.hall-btn')).forEach(b => b.classList.remove('active'));
                            hallBtn.classList.add('active');
                            
                            // Apply hall filter
                            applyHallFilter(savedState.hall);
                        }
                    }
                }
                
                // Re-animate the current active timeline
                const activeTimeline = document.querySelector('.timeline.active');
                if (activeTimeline) {
                    const timelineId = activeTimeline.id;
                    animateTimelineCards(timelineId);
                }
            }
        });
    });
}

// ========== APPLY HALL FILTER ==========
function applyHallFilter(hall) {
    console.log('Applying hall filter for:', hall);
    const timelines = document.querySelectorAll('.timeline');
    let totalCards = 0;
    let visibleCards = 0;
    
    timelines.forEach(tl => {
        const cards = tl.querySelectorAll('.session-card');
        totalCards += cards.length;
        
        cards.forEach(card => {
            const cardHall = card.getAttribute('data-hall') || 'All';
            const isMatch = hall === 'all' || hall === cardHall;
            
            if (isMatch) {
                card.style.display = 'block';
                card.style.opacity = '1';  // Ensure card is visible (override CSS opacity: 0)
                card.style.transform = 'translateY(0)';  // Reset transform
                visibleCards++;
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    console.log(`Hall filter applied: ${visibleCards} visible out of ${totalCards} total cards`);
}

// ========== RESTORE FILTER STATE ==========
function restoreFilterState() {
    const savedState = loadFilterState();
    if (!savedState) {
        console.log('No saved filter state found');
        updateClearFiltersButtonVisibility();
        return;
    }
    
    console.log('Restoring filter state:', savedState);
    
    // Restore day tab (language already restored in init())
    if (savedState.day) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const timelines = document.querySelectorAll('.timeline');
        
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-day') === savedState.day) {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Switch timelines WITHOUT animation
                timelines.forEach(t => {
                    t.classList.remove('active');
                    t.style.display = 'none';
                });
                
                const targetTimeline = document.getElementById(`timeline-day${savedState.day}`);
                if (targetTimeline) {
                    targetTimeline.style.display = 'block';
                    targetTimeline.classList.add('active');
                    targetTimeline.style.opacity = '1';
                }
            }
        });
    }
    
    // Restore hall filter
    if (savedState.hall) {
        const hallBtns = document.querySelectorAll('.hall-btn');
        hallBtns.forEach(btn => {
            if (btn.getAttribute('data-hall') === savedState.hall) {
                hallBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
        
        // Apply hall filter
        console.log('Applying hall filter:', savedState.hall);
        applyHallFilter(savedState.hall);
        
        // Verify cards are visible
        const activeTimeline = document.querySelector('.timeline.active');
        if (activeTimeline) {
            const cards = activeTimeline.querySelectorAll('.session-card');
            console.log(`Total cards in active timeline: ${cards.length}`);
            let visibleCount = 0;
            cards.forEach(card => {
                if (card.style.display !== 'none') {
                    visibleCount++;
                }
            });
            console.log(`Visible cards after filter: ${visibleCount}`);
        }
    }
    
    // Update button visibility after restoration
    updateClearFiltersButtonVisibility();
}

// ========== CLEAR FILTERS ==========
function initClearFilters() {
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (!clearBtn) return;
    
    clearBtn.addEventListener('click', () => {
        console.log('🔄 Clearing filters...');
        
        // Clear localStorage FIRST
        clearFilterState();
        
        // Reset to defaults
        currentLanguage = 'en';
        
        // Reset language buttons
        const languageBtns = document.querySelectorAll('.language-btn');
        languageBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-language') === 'en') {
                btn.classList.add('active');
            }
        });
        
        // Reset day tabs to Day 1
        const tabButtons = document.querySelectorAll('.tab-btn');
        const timelines = document.querySelectorAll('.timeline');
        
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-day') === '1') {
                btn.classList.add('active');
            }
        });
        
        // Show Day 1 timeline
        timelines.forEach(t => {
            t.classList.remove('active');
            t.style.display = 'none';
        });
        
        const day1Timeline = document.getElementById('timeline-day1');
        if (day1Timeline) {
            day1Timeline.style.display = 'block';
            day1Timeline.classList.add('active');
            gsap.to(day1Timeline, { opacity: 1, duration: 0.3 });
        }
        
        // Reset hall filter to 'all'
        const hallBtns = document.querySelectorAll('.hall-btn');
        hallBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-hall') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Update UI text BEFORE reloading sessions
        updateUIText();
        
        // Reload sessions with English language
        if (allSessions.length > 0) {
            populateTimelines(allSessions);
        }
        
        // Show all cards
        applyHallFilter('all');
        
        // Animate cards
        setTimeout(() => {
            animateTimelineCards('timeline-day1');
        }, 100);
        
        // Force update button visibility after ALL DOM updates are complete
        // Use requestAnimationFrame to ensure state is fully synchronized
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateClearFiltersButtonVisibility();
                console.log('✅ Filters cleared, button visibility updated');
            });
        });
    });
}

// ========== INITIALIZE APP ==========
function init() {
    console.log('🌉 Initializing Digital Bridge 2025...');

    // Initialize particle background
    initParticleBackground();

    // Initialize day tabs
    initDayTabs();

    // Initialize hall filters
    initHallFilters();

    // Initialize language switching
    initLanguageSwitch();
    
    // Initialize clear filters button
    initClearFilters();
    
    // Check for saved state first
    const savedState = loadFilterState();
    if (savedState && savedState.language) {
        currentLanguage = savedState.language;
        const languageBtns = document.querySelectorAll('.language-btn');
        languageBtns.forEach(btn => {
            if (btn.getAttribute('data-language') === savedState.language) {
                languageBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    }
    
    // Set initial UI text
    updateUIText();
    
    // Load and populate sessions
    const sessions = loadSessions();
    if (sessions.length > 0) {
        populateTimelines(sessions);
        console.log(`Loaded ${sessions.length} sessions`);
        
        // Use requestAnimationFrame to ensure DOM is updated before restoring filters
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                restoreFilterState();
                // Update button visibility after state is fully restored
                updateClearFiltersButtonVisibility();
            });
        });
    } else {
        console.warn('No sessions data loaded');
        // Still update button visibility even if no sessions
        updateClearFiltersButtonVisibility();
    }

    // Initialize draggable scrolling
    initDraggableScroll();

    // Initialize GSAP animations
    if (typeof gsap !== 'undefined') {
        initAnimations();
    } else {
        console.warn('GSAP not loaded, animations disabled');
    }

    console.log('✅ Digital Bridge 2025 loaded successfully');
}

// ========== DRAGGABLE SCROLLING ==========
function initDraggableScroll() {
    const timelineSessions = document.querySelectorAll('.timeline-sessions');
    
    timelineSessions.forEach(timeline => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // Mouse events
        timeline.addEventListener('mousedown', (e) => {
            isDown = true;
            timeline.style.cursor = 'grabbing';
            startX = e.pageX - timeline.offsetLeft;
            scrollLeft = timeline.scrollLeft;
        });
        
        timeline.addEventListener('mouseleave', () => {
            isDown = false;
            timeline.style.cursor = 'grab';
        });
        
        timeline.addEventListener('mouseup', () => {
            isDown = false;
            timeline.style.cursor = 'grab';
        });
        
        timeline.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - timeline.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            timeline.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchScrollLeft = 0;
        
        timeline.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchScrollLeft = timeline.scrollLeft;
        });
        
        timeline.addEventListener('touchmove', (e) => {
            if (!touchStartX) return;
            const touchX = e.touches[0].clientX;
            const walk = (touchStartX - touchX) * 1.5; // Touch scroll speed
            timeline.scrollLeft = touchScrollLeft + walk;
        });
        
        timeline.addEventListener('touchend', () => {
            touchStartX = 0;
        });
        
        // Set initial cursor
        timeline.style.cursor = 'grab';
    });
}

// ========== START APPLICATION ==========
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

