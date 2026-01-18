// State management
let events = []; // Now empty, will be filled by API
let currentFilter = 'all';

// DOM elements
const eventsContainer = document.getElementById('events-container');
const noEventsMessage = document.getElementById('no-events');
const filterButtons = document.querySelectorAll('.filter-btn');
const allCountSpan = document.getElementById('all-count');
const doneCountSpan = document.getElementById('done-count');
const upcomingCountSpan = document.getElementById('upcoming-count');
const loadingMessage = document.getElementById('loading-message'); // Ensure you have this in HTML or it will be ignored safely

// --- NEW FUNCTION: Fetch Events from Backend ---
async function fetchEvents() {
    try {
        // Fetch from the NEW separate API we created
        const response = await fetch('http://localhost:5000/api/website-events'); 
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const dbEvents = await response.json();

        // Prepare current date for comparison (set time to midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Map Database Fields to Frontend Format
        events = dbEvents.map(event => {
            const eventDate = new Date(event.event_date);
            
            // AUTOMATIC STATUS: If date is past, mark as 'done'
            const status = eventDate < today ? 'done' : 'upcoming';

            return {
                id: event.id,
                title: event.title,
                date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                time: event.time || 'Time TBD',
                location: event.location || 'Location TBD',
                status: status,
                description: event.description || '',
                faculty: event.faculty || ''
            };
        });

        // Hide loading text if it exists
        if (loadingMessage) loadingMessage.style.display = 'none';

        // Update UI
        renderEvents();
        updateFilterCounts();

    } catch (error) {
        console.error('Error loading events:', error);
        if (loadingMessage) loadingMessage.textContent = 'Failed to load events. Please try again later.';
    }
}

// Helper function to create event card HTML
function createEventCardHTML(event) {
    const badgeClass = event.status === 'done' ? 'completed' : 'upcoming';
    const badgeText = event.status === 'done' ? 'Completed' : 'Upcoming';
    
    return `
        <div class="event-card">
            <div class="event-header">
                <h3 class="event-title">${event.title}</h3>
                <div class="badge ${badgeClass}">${badgeText}</div>
            </div>
            
            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
            
            <div class="event-meta">
                <div class="meta-item">
                    <span class="calendar-icon"></span>
                    <span>${event.date}</span>
                </div>
                 <div class="meta-item">
                    <i class="fas fa-clock" style="margin-right:8px; color:#c55302;"></i>
                    <span>${event.time}</span>
                </div>
                ${event.location ? `
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt" style="margin-right:8px; color:#c55302;"></i>
                    <span>${event.location}</span>
                </div>` : ''}
                ${event.faculty ? `
                    <div class="meta-item">
                        <span class="user-icon"></span>
                        <span>${event.faculty}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Function to filter events
function getFilteredEvents(filter) {
    if (filter === 'all') return events;
    return events.filter(event => event.status === filter);
}

// Function to render events
function renderEvents() {
    const filteredEvents = getFilteredEvents(currentFilter);
    
    if (filteredEvents.length === 0) {
        eventsContainer.style.display = 'none';
        noEventsMessage.style.display = 'block';
    } else {
        eventsContainer.style.display = 'flex'; // Ensure flex layout is applied
        noEventsMessage.style.display = 'none';
        eventsContainer.innerHTML = filteredEvents.map(createEventCardHTML).join('');
    }
}

// Function to update filter counts
function updateFilterCounts() {
    const allCount = events.length;
    const doneCount = events.filter(e => e.status === 'done').length;
    const upcomingCount = events.filter(e => e.status === 'upcoming').length;
    
    if(allCountSpan) allCountSpan.textContent = allCount;
    if(doneCountSpan) doneCountSpan.textContent = doneCount;
    if(upcomingCountSpan) upcomingCountSpan.textContent = upcomingCount;
}

// Function to handle filter button clicks
function handleFilterClick(event) {
    const clickedButton = event.target.closest('.filter-btn'); 
    if (!clickedButton) return;
    
    const filter = clickedButton.getAttribute('data-filter');
    
    // Update current filter
    currentFilter = filter;
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    
    // Re-render events
    renderEvents();
}

// Initialize the application
function init() {
    // 1. Fetch Data from Database (replaces hardcoded data)
    fetchEvents();
    
    // 2. Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });

    // 3. Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

 // 1. Mobile Menu Toggle
    document.getElementById("menu-btn").addEventListener("click", () => {
      document.getElementById("mobile-menu").classList.toggle("hidden");
    });
