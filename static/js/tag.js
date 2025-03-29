document.addEventListener('DOMContentLoaded', () => {
    // API base URL - replace with your actual API endpoint
    const API_BASE_URL = '/';
    
    // DOM elements
    const tagHeader = document.getElementById('tag-header');
    const questionsContainer = document.getElementById('questions-container');
    const relatedTagsContainer = document.getElementById('related-tags');
    const paginationContainer = document.getElementById('pagination');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Modal elements
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const closeBtns = document.querySelectorAll('.close');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Get tag name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagName = urlParams.get('tag');
    
    // Current state
    let currentPage = 1;
    let currentFilter = 'newest';
    let isAuthenticated = false; // Will be set based on auth check
    
    // Check if user is authenticated
    function checkAuthentication() {
        // In a real app, you would check for a token in localStorage or cookies
        const token = localStorage.getItem('authToken');
        if (token) {
            isAuthenticated = true;
            updateAuthUI();
        }
    }
    
    // Update UI based on authentication status
    function updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        if (isAuthenticated) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <img src="/placeholder.svg?height=32&width=32" alt="User avatar" class="user-avatar">
                    <button id="logout-btn" class="btn btn-outline">Log out</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            authButtons.innerHTML = `
                <button id="login-btn" class="btn btn-outline">Log in</button>
                <button id="signup-btn" class="btn btn-primary">Sign up</button>
            `;
            document.getElementById('login-btn').addEventListener('click', () => openModal(loginModal));
            document.getElementById('signup-btn').addEventListener('click', () => openModal(signupModal));
        }
    }
    
    // Handle logout
    function handleLogout() {
        localStorage.removeItem('authToken');
        isAuthenticated = false;
        updateAuthUI();
    }
    
    // Fetch tag information
    async function fetchTagInfo() {
        if (!tagName) {
            window.location.href = 'tags.html';
            return;
        }
        
        try {
            // In a real app, you would fetch from API
            // const response = await fetch(`${API_BASE_URL}/tags/${tagName}/`);
            // const data = await response.json();
            
            // Simulated API response
            const data = {
                name: tagName,
                description: getTagDescription(tagName),
                count: Math.floor(Math.random() * 10000) + 100,
                today_count: Math.floor(Math.random() * 20)
            };
            
            document.title = `${data.name} - DevOverflow`;
            renderTagHeader(data);
            fetchRelatedTags();
            
        } catch (error) {
            console.error('Error fetching tag info:', error);
            tagHeader.innerHTML = '<div class="error-message">Failed to load tag information. Please try again later.</div>';
        }
    }
    
    // Fetch questions with the tag
    async function fetchQuestions(page = 1, filter = 'newest') {
        questionsContainer.innerHTML = '<div class="loading-spinner">Loading questions...</div>';
        
        try {
            // In a real app, you would fetch from API
            // const response = await fetch(`${API_BASE_URL}/questions/?tag=${tagName}&page=${page}&ordering=${getOrdering(filter)}`);
            // const data = await response.json();
            
            // Simulated API response
            const data = {
                results: generateMockQuestions(10, tagName),
                count: 100,
                next: page < 10 ? `${API_BASE_URL}/questions/?tag=${tagName}&page=${page + 1}` : null,
                previous: page > 1 ? `${API_BASE_URL}/questions/?tag=${tagName}&page=${page - 1}` : null
            };
            
            renderQuestions(data.results);
            renderPagination(page, Math.ceil(data.count / 10));
            
        } catch (error) {
            console.error('Error fetching questions:', error);
            questionsContainer.innerHTML = '<div class="error-message">Failed to load questions. Please try again later.</div>';
        }
    }
    
    // Fetch related tags
    async function fetchRelatedTags() {
        try {
            // In a real app, you would fetch from API
            // const response = await fetch(`${API_BASE_URL}/tags/related/${tagName}/`);
            // const data = await response.json();
            
            // Simulated API response
            const data = {
                results: generateRelatedTags(tagName, 10)
            };
            
            renderRelatedTags(data.results);
            
        } catch (error) {
            console.error('Error fetching related tags:', error);
            relatedTagsContainer.innerHTML = '<div class="error-message">Failed to load related tags.</div>';
        }
    }
    
    // Render tag header
    function renderTagHeader(tag) {
        tagHeader.innerHTML = `
            <div class="tag tag-large">${tag.name}</div>
            <div class="tag-info">
                <div>${tag.count} questions</div>
                <div>${tag.today_count} asked today</div>
            </div>
            <div class="tag-actions">
                <button class="btn btn-outline" id="watch-tag-btn">
                    <i class="far fa-eye"></i> Watch
                </button>
                <button class="btn btn-outline" id="ask-question-btn">
                    <i class="fas fa-question"></i> Ask Question
                </button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('watch-tag-btn').addEventListener('click', () => {
            if (!isAuthenticated) {
                openModal(loginModal);
                return;
            }
            
            // Toggle watch status
            const watchBtn = document.getElementById('watch-tag-btn');
            if (watchBtn.innerHTML.includes('Watch')) {
                watchBtn.innerHTML = '<i class="fas fa-eye"></i> Watching';
                watchBtn.classList.add('btn-primary');
                watchBtn.classList.remove('btn-outline');
            } else {
                watchBtn.innerHTML = '<i class="far fa-eye"></i> Watch';
                watchBtn.classList.remove('btn-primary');
                watchBtn.classList.add('btn-outline');
            }
        });
        
        document.getElementById('ask-question-btn').addEventListener('click', () => {
            if (!isAuthenticated) {
                openModal(loginModal);
                return;
            }
            
            window.location.href = `ask-question.html?tag=${tagName}`;
        });
    }
    
    // Render questions to DOM
    function renderQuestions(questions) {
        if (!questions || questions.length === 0) {
            questionsContainer.innerHTML = '<div class="no-results">No questions found with this tag.</div>';
            return;
        }
        
        let html = '';
        
        questions.forEach(question => {
            html += `
                <div class="question-item">
                    <div class="question-stats">
                        <div class="stat">
                            <div class="stat-number">${question.votes}</div>
                            <div class="stat-label">votes</div>
                        </div>
                        <div class="stat ${question.answers > 0 ? 'has-answers' : ''}">
                            <div class="stat-number">${question.answers}</div>
                            <div class="stat-label">answers</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${question.views}</div>
                            <div class="stat-label">views</div>
                        </div>
                    </div>
                    <div class="question-content">
                        <h3 class="question-title">
                            <a href="question.html?id=${question.id}">${question.title}</a>
                        </h3>
                        <div class="question-excerpt">${question.excerpt}</div>
                        <div class="question-meta">
                            <div class="question-tags">
                                ${question.tags.map(tag => `<a href="tag.html?tag=${tag}" class="tag">${tag}</a>`).join('')}
                            </div>
                            <div class="question-user">
                                <img src="${question.user.avatar}" alt="${question.user.name}" class="user-avatar">
                                <span>${question.user.name}</span>
                                <span>asked ${formatDate(question.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        questionsContainer.innerHTML = html;
    }
    
    // Render related tags
    function renderRelatedTags(tags) {
        if (!tags || tags.length === 0) {
            relatedTagsContainer.innerHTML = '<div class="no-tags">No related tags found.</div>';
            return;
        }
        
        let html = '';
        
        tags.forEach(tag => {
            html += `<a href="tag.html?tag=${tag.name}" class="tag">${tag.name} <span class="tag-count">×${tag.count}</span></a>`;
        });
        
        relatedTagsContainer.innerHTML = html;
    }
    
    // Render pagination
    function renderPagination(currentPage, totalPages) {
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        if (currentPage > 1) {
            html += `<button class="pagination-btn prev-btn" data-page="${currentPage - 1}">Prev</button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            html += `<button class="pagination-btn next-btn" data-page="${currentPage + 1}">Next</button>`;
        }
        
        paginationContainer.innerHTML = html;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const page = Number.parseInt(this.dataset.page);
                currentPage = page;
                fetchQuestions(page, currentFilter);
                window.scrollTo(0, 0);
            });
        });
    }
    
    // Format date to relative time (e.g., "2 hours ago")
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    }
    
    // Get ordering parameter based on filter
    function getOrdering(filter) {
        switch(filter) {
            case 'newest':
                return '-created_at';
            case 'active':
                return '-last_activity';
            case 'unanswered':
                return '-created_at&answered=false';
            default:
                return '-created_at';
        }
    }
    
    // Get tag description based on tag name
    function getTagDescription(tag) {
        const descriptions = {
            'javascript': 'JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.',
            'python': 'Python is a multi-paradigm, dynamically typed, multipurpose programming language.',
            'java': 'Java is a high-level, class-based, object-oriented programming language.',
            'c#': 'C# is a general-purpose, multi-paradigm programming language.',
            'php': 'PHP is a general-purpose scripting language geared towards web development.',
            'html': 'HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.',
            'css': 'CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML.',
            'react': 'React is a JavaScript library for building user interfaces.',
            'django': 'Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.',
            'node.js': 'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.'
        };
        
        return descriptions[tag.toLowerCase()] || `Questions related to ${tag}`;
    }
    
    // Generate mock questions for demo purposes
    function generateMockQuestions(count, tagName) {
        const questions = [];
        
        for (let i = 1; i <= count; i++) {
            // Generate related tags (always include the main tag)
            const relatedTags = [tagName];
            const possibleTags = ['javascript', 'python', 'java', 'html', 'css', 'react', 'django', 'node.js'].filter(t => t !== tagName);
            
            // Add 1-2 random related tags
            for (let j = 0; j < Math.min(2, Math.floor(Math.random() * 3)); j++) {
                const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
                if (!relatedTags.includes(randomTag)) {
                    relatedTags.push(randomTag);
                }
            }
            
            // Generate title and excerpt based on the tag
            let title, excerpt;
            
            if (tagName === 'javascript' || tagName === 'react') {
                title = `How to ${i % 2 === 0 ? 'implement authentication' : 'handle state'} in ${tagName}?`;
                excerpt = `I'm building a ${tagName} application and I need help with ${i % 2 === 0 ? 'implementing user authentication' : 'state management'}. I've tried several approaches but none of them seem to work correctly.`;
            } else if (tagName === 'python' || tagName === 'django') {
                title = `Best practices for ${i % 2 === 0 ? 'database models' : 'API design'} in ${tagName}`;
                excerpt = `I'm working on a ${tagName} project and I want to know the best practices for ${i % 2 === 0 ? 'designing database models' : 'building RESTful APIs'}. What are the recommended approaches?`;
            } else {
                title = `How to solve ${tagName} ${i % 2 === 0 ? 'performance' : 'compatibility'} issues?`;
                excerpt = `I'm experiencing ${i % 2 === 0 ? 'performance' : 'compatibility'} issues with my ${tagName} code. Here's what I've tried so far...`;
            }
            
            questions.push({
                id: i,
                title: title,
                excerpt: excerpt,
                votes: Math.floor(Math.random() * 50),
                answers: Math.floor(Math.random() * 5),
                views: Math.floor(Math.random() * 1000) + 100,
                tags: relatedTags,
                user: {
                    name: `user${Math.floor(Math.random() * 100)}`,
                    avatar: `/placeholder.svg?height=32&width=32`
                },
                created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
            });
        }
        
        return questions;
    }
    
    // Generate related tags for demo purposes
    function generateRelatedTags(mainTag, count) {
        const relatedTags = [];
        const allTags = {
            'javascript': ['react', 'node.js', 'typescript', 'vue.js', 'angular', 'jquery', 'html', 'css'],
            'python': ['django', 'flask', 'pandas', 'numpy', 'tensorflow', 'machine-learning', 'data-science'],
            'java': ['spring', 'android', 'hibernate', 'maven', 'kotlin', 'jdbc', 'spring-boot'],
            'html': ['css', 'javascript', 'bootstrap', 'html5', 'responsive-design', 'dom', 'jquery'],
            'css': ['html', 'javascript', 'bootstrap', 'sass', 'less', 'flexbox', 'css-grid'],
            'react': ['javascript', 'jsx', 'redux', 'react-hooks', 'react-router', 'next.js', 'typescript'],
            'django': ['python', 'django-rest-framework', 'django-models', 'django-forms', 'django-static'],
            'node.js': ['javascript', 'express', 'npm', 'mongodb', 'mongoose', 'socket.io', 'rest-api']
        };
        
        // Get related tags for the main tag, or use a default set
        const relatedTagsList = allTags[mainTag.toLowerCase()] || ['javascript', 'python', 'java', 'html', 'css'];
        
        // Generate the specified number of related tags
        for (let i = 0; i < Math.min(count, relatedTagsList.length); i++) {
            relatedTags.push({
                name: relatedTagsList[i],
                count: Math.floor(Math.random() * 5000) + 100
            });
        }
        
        return relatedTags;
    }
    
    // Modal functions
    function openModal(modal) {
        modal.style.display = 'block';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Event listeners
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active class
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update current filter and fetch questions
            currentFilter = filter;
            currentPage = 1;
            fetchQuestions(currentPage, currentFilter);
        });
    });
    
    // Modal close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });
    
    // Switch between login and signup
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Form submissions
    loginForm.addEventListener

