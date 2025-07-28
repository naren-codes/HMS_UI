

$(document).ready(function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
    
    // Add active class to current nav item based on current page
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentLocation.includes(linkPath) && linkPath !== 'index.html') {
            link.classList.add('active');
        } else if (currentLocation.endsWith('/') && linkPath === 'index.html') {
            link.classList.add('active');
        }
    });
    
    // Handle recent activities display
    loadRecentActivities();
    
    // Format dates to a more readable format
    $('.format-date').each(function() {
        const dateStr = $(this).text();
        if (dateStr) {
            try {
                const date = new Date(dateStr);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                $(this).text(date.toLocaleDateString('en-US', options));
            } catch (e) {
                console.error('Error formatting date:', e);
            }
        }
    });
    
    // Handle mobile sidebar toggle
    $('#sidebarToggle').on('click', function() {
        $('.sidebar').toggleClass('show');
    });
    
    // Handle form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Notification badge update (simulated)
    function updateNotificationBadge() {
        const notificationCount = Math.floor(Math.random() * 5);
        $('#notificationBadge').text(notificationCount);
        
        if (notificationCount > 0) {
            $('#notificationBadge').removeClass('d-none');
        } else {
            $('#notificationBadge').addClass('d-none');
        }
    }
    
    // Call once on page load
    updateNotificationBadge();
    
    // Simple dark mode toggle
    $('#darkModeToggle').on('click', function() {
        $('body').toggleClass('dark-mode');
        
        // Save preference to localStorage
        if ($('body').hasClass('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
    }
});

/**
 * Format a date string to a more user-friendly format
 * @param {string} dateStr - The date string to format
 * @returns {string} - Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format a time string to a more user-friendly format
 * @param {string} timeStr - The time string to format (HH:MM)
 * @returns {string} - Formatted time in 12-hour format
 */
function formatTime(timeStr) {
    if (!timeStr) return '';
    
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    
    if (hourNum < 12) {
        return `${hourNum === 0 ? '12' : hourNum}:${minute} AM`;
    } else {
        return `${hourNum === 12 ? '12' : hourNum - 12}:${minute} PM`;
    }
}

/**
 * Show a toast notification
 * @param {string} message - The notification message
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    if ($('#toastContainer').length === 0) {
        const toastContainer = `
            <div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>
        `;
        $('body').append(toastContainer);
    }
    
    // Generate a unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Set background color based on type
    let bgClass = 'bg-info';
    switch(type) {
        case 'success':
            bgClass = 'bg-success';
            break;
        case 'error':
            bgClass = 'bg-danger';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            break;
    }
    
    // Create toast HTML
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container
    $('#toastContainer').append(toastHtml);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
}

/**
 * Loads and displays recent activities on the dashboard
 */
function loadRecentActivities() {
    // Only run this on the homepage
    if (!window.location.pathname.includes('index.html') && 
        !window.location.pathname.endsWith('/') && 
        !window.location.pathname.endsWith('/HMS/frontend/')) {
        return;
    }
    
    // Get activities from localStorage
    const activities = JSON.parse(localStorage.getItem('userActivities')) || [];
    const recentActivitiesContainer = $('#recentActivitiesList');
    
    // If no activities, show the empty state (already in the HTML)
    if (activities.length === 0) {
        return;
    }
    
    // Clear the container
    recentActivitiesContainer.empty();
    
    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Show only the 3 most recent activities
    const recentActivities = activities.slice(0, 3);
    
    // Add each activity to the container
    recentActivities.forEach(activity => {
        let activityElement;
        
        switch(activity.type) {
            case 'appointment-booked':
                activityElement = $('#activityTemplates').find('[data-activity-type="appointment-booked"]').clone();
                activityElement.find('.activity-doctor').text(activity.doctor);
                activityElement.find('.activity-date').text(formatDate(activity.date));
                activityElement.find('.activity-time').text(formatTime(activity.time));
                break;
            
            case 'profile-updated':
                activityElement = $('#activityTemplates').find('[data-activity-type="profile-updated"]').clone();
                break;
            
            default:
                return; // Skip unknown activity types
        }
        
        // Set the time
        activityElement.find('.activity-time').text(getRelativeTime(activity.timestamp));
        
        // Only show the "New" badge for activities less than 1 hour old
        if (Date.now() - activity.timestamp > 3600000) {
            activityElement.find('.badge.bg-info').remove();
        }
        
        // Add to the container
        recentActivitiesContainer.append(activityElement);
    });
}

/**
 * Records a new user activity
 * @param {Object} activity - The activity details to record
 */
function recordUserActivity(activity) {
    // Get existing activities
    const activities = JSON.parse(localStorage.getItem('userActivities')) || [];
    
    // Add the new activity with timestamp
    const newActivity = {
        ...activity,
        timestamp: Date.now()
    };
    
    // Add to the beginning of the array
    activities.unshift(newActivity);
    
    // Keep only the most recent 20 activities
    const trimmedActivities = activities.slice(0, 20);
    
    // Store back in localStorage
    localStorage.setItem('userActivities', JSON.stringify(trimmedActivities));
}

/**
 * Get relative time string (e.g. "5 minutes ago")
 * @param {number} timestamp - The timestamp to compare
 * @returns {string} - Relative time string
 */
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
        return 'Just now';
    }
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    
    if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    
    if (days < 7) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Just use the date
    return formatDate(new Date(timestamp));
}
