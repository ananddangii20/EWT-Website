// Events data from TCET-EWT Activity Calendar (Tentative) Odd Semester A.Y 2025-26
const events = [
    {
        id: 1,
        title: "Committee Formation (Appointment of Managers & Leaders)",
        date: "July 4, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Conference Hall",
        status: "done",
        description: "Formation of committees and appointment of managers and leaders for the academic year.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 2,
        title: "Orientation Program for New Volunteers",
        date: "July 25, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Main Auditorium",
        status: "done",
        description: "Orientation session for new volunteers joining the EWT program.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 3,
        title: "Essay Competition Online",
        date: "August 12-16, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Online Platform",
        status: "done",
        description: "Online essay competition for students on various social topics.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 4,
        title: "Independence Day",
        date: "August 15, 2025",
        time: "All Day",
        location: "College Campus",
        status: "done",
        description: "Independence Day celebration and flag hoisting ceremony.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 5,
        title: "Video Making based on Education for All Activity",
        date: "August 22, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Media Lab",
        status: "done",
        description: "Video creation activity focusing on Education for All initiative.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 6,
        title: "Group Discussion on Social Topics (EFA)",
        date: "September 6, 2025",
        time: "All Day",
        location: "Seminar Hall",
        status: "upcoming",
        description: "Group discussions on various social topics related to Education for All.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 7,
        title: "Swachhata Pakhwada",
        date: "September 1-15, 2025",
        time: "All Day",
        location: "College Campus",
        status: "upcoming",
        description: "Cleanliness drive and awareness program for two weeks.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 8,
        title: "Idea Presentations on Street Children Literacy",
        date: "September 20, 2025",
        time: "All Day",
        location: "Presentation Hall",
        status: "upcoming",
        description: "Student presentations on innovative ideas for street children literacy programs.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 9,
        title: "Poster Competition Online",
        date: "September 27, 2025",
        time: "All Day",
        location: "Online Platform",
        status: "upcoming",
        description: "Online poster competition on social awareness themes.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 10,
        title: "Debate Competition",
        date: "October 3, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Main Auditorium",
        status: "upcoming",
        description: "Inter-collegiate debate competition on current social issues.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 11,
        title: "Adolescence Education",
        date: "October 10, 2025",
        time: "3:30 PM - 5:30 PM",
        location: "Conference Hall",
        status: "upcoming",
        description: "Educational session on adolescence awareness and guidance.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 12,
        title: "Street Children Literacy",
        date: "October 18, 2025",
        time: "All Day",
        location: "Community Center",
        status: "upcoming",
        description: "Literacy program for street children in the local community.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 13,
        title: "Cultural Creativity",
        date: "October 25, 2025",
        time: "All Day",
        location: "Cultural Hall",
        status: "upcoming",
        description: "Cultural creativity showcase and competition.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 14,
        title: "Vidya Vikas Education",
        date: "July 27 - October 25, 2025",
        time: "Every Saturday",
        location: "Various Locations",
        status: "upcoming",
        description: "Ongoing education program every Saturday except 3rd Saturday of month.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 15,
        title: "Orphanage Visit",
        date: "Every 3rd Saturday",
        time: "All Day",
        location: "Local Orphanages",
        status: "upcoming",
        description: "Regular visits to orphanages for social service activities.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 16,
        title: "Old Home Visit",
        date: "Every 2nd Saturday",
        time: "All Day",
        location: "Senior Care Centers",
        status: "upcoming",
        description: "Regular visits to old age homes for social service activities.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 17,
        title: "Municipal School Fail Student Counseling Sessions",
        date: "October 25, 2025",
        time: "All Day",
        location: "Municipal Schools",
        status: "upcoming",
        description: "Counseling sessions for struggling students in municipal schools.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    },
    {
        id: 18,
        title: "First Term Training Programme",
        date: "TBD",
        time: "TBD",
        location: "TBD",
        status: "upcoming",
        description: "Training program schedule to be declared by university.",
        faculty: "Mr. Mahesh Biradar, Dr. Nidhi Tiwari"
    }
];

// State management
let currentFilter = 'all';

// DOM elements
const eventsContainer = document.getElementById('events-container');
const noEventsMessage = document.getElementById('no-events');
const filterButtons = document.querySelectorAll('.filter-btn');
const allCountSpan = document.getElementById('all-count');
const doneCountSpan = document.getElementById('done-count');
const upcomingCountSpan = document.getElementById('upcoming-count');

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
        eventsContainer.style.display = 'flex';
        noEventsMessage.style.display = 'none';
        eventsContainer.innerHTML = filteredEvents.map(createEventCardHTML).join('');
    }
}

// Function to update filter counts
function updateFilterCounts() {
    const allCount = events.length;
    const doneCount = events.filter(e => e.status === 'done').length;
    const upcomingCount = events.filter(e => e.status === 'upcoming').length;
    
    allCountSpan.textContent = allCount;
    doneCountSpan.textContent = doneCount;
    upcomingCountSpan.textContent = upcomingCount;
}

// Function to handle filter button clicks
function handleFilterClick(event) {
    const clickedButton = event.target.closest('.filter-btn'); // Use closest to handle clicks on child spans
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
    // Update filter counts
    updateFilterCounts();
    
    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    // Initial render
    renderEvents();

    // --- START: CORRECTED HAMBURGER MENU LOGIC ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Check if the elements exist before adding an event listener
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            // Toggle the 'open' class which is styled in events.css
            mobileMenu.classList.toggle('open');
        });
    }
    // --- END: CORRECTED HAMBURGER MENU LOGIC ---
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);