document.addEventListener("DOMContentLoaded", () => {
  // API base URL - replace with your actual API endpoint
  const API_BASE_URL = "/"

  // DOM elements
  const tagsContainer = document.getElementById("tags-container")
  const tagFilter = document.getElementById("tag-filter")
  const paginationContainer = document.getElementById("pagination")

  // Modal elements
  const loginModal = document.getElementById("login-modal")
  const signupModal = document.getElementById("signup-modal")
  const loginBtn = document.getElementById("login-btn")
  const signupBtn = document.getElementById("signup-btn")
  const closeBtns = document.querySelectorAll(".close")
  const switchToSignup = document.getElementById("switch-to-signup")
  const switchToLogin = document.getElementById("switch-to-login")

  // Forms
  const loginForm = document.getElementById("login-form")
  const signupForm = document.getElementById("signup-form")

  // Current state
  const currentPage = 1
  let isAuthenticated = false // Will be set based on auth check
  let allTags = [] // Store all tags for filtering

  // Check if user is authenticated
  function checkAuthentication() {
    // In a real app, you would check for a token in localStorage or cookies
    const token = localStorage.getItem("authToken")
    if (token) {
      isAuthenticated = true
      updateAuthUI()
    }
  }

  // Update UI based on authentication status
  function updateAuthUI() {
    const authButtons = document.querySelector(".auth-buttons")
    if (isAuthenticated) {
      authButtons.innerHTML = `
                <div class="user-menu">
                    <img src="/placeholder.svg?height=32&width=32" alt="User avatar" class="user-avatar">
                    <button id="logout-btn" class="btn btn-outline">Log out</button>
                </div>
            `
      document.getElementById("logout-btn").addEventListener("click", handleLogout)
    } else {
      authButtons.innerHTML = `
                <button id="login-btn" class="btn btn-outline">Log in</button>
                <button id="signup-btn" class="btn btn-primary">Sign up</button>
            `
      document.getElementById("login-btn").addEventListener("click", () => openModal(loginModal))
      document.getElementById("signup-btn").addEventListener("click", () => openModal(signupModal))
    }
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem("authToken")
    isAuthenticated = false
    updateAuthUI()
  }

  // Fetch tags from API
  async function fetchTags(page = 1) {
    tagsContainer.innerHTML = '<div class="loading-spinner">Loading tags...</div>'

    try {
      // In a real app, you would fetch from API
      // const response = await fetch(`${API_BASE_URL}/tags/?page=${page}&ordering=-count`);
      // const data = await response.json();

      // Simulated API response
      const data = {
        results: generateMockTags(50),
        count: 50,
        next: null,
        previous: null,
      }

      allTags = data.results
      renderTags(data.results)
      renderPagination(page, Math.ceil(data.count / 50))
    } catch (error) {
      console.error("Error fetching tags:", error)
      tagsContainer.innerHTML = '<div class="error-message">Failed to load tags. Please try again later.</div>'
    }
  }

  // Render tags to DOM
  function renderTags(tags) {
    if (!tags || tags.length === 0) {
      tagsContainer.innerHTML = '<div class="no-results">No tags found matching your criteria.</div>'
      return
    }

    let html = ""

    tags.forEach((tag) => {
      html += `
                <div class="tag-card">
                    <div class="tag-name">
                        <a href="tag.html?tag=${tag.name}">${tag.name}</a>
                    </div>
                    <div class="tag-description">
                        ${tag.description || "No description available."}
                    </div>
                    <div class="tag-stats">
                        <span>${tag.count} questions</span>
                        <span>${tag.today_count} asked today</span>
                    </div>
                </div>
            `
    })

    tagsContainer.innerHTML = html
  }

  // Render pagination
  function renderPagination(currentPage, totalPages) {
    if (totalPages <= 1) {
      paginationContainer.innerHTML = ""
      return
    }

    let html = ""

    // Previous button
    if (currentPage > 1) {
      html += `<button class="pagination-btn prev-btn" data-page="${currentPage - 1}">Prev</button>`
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`
    }

    // Next button
    if (currentPage < totalPages) {
      html += `<button class="pagination-btn next-btn" data-page="${currentPage + 1}">Next</button>`
    }

    paginationContainer.innerHTML = html

    // Add event listeners to pagination buttons
    document.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const page = Number.parseInt(this.dataset.page)
        currentPage = page
        fetchTags(page)
        window.scrollTo(0, 0)
      })
    })
  }

  // Filter tags based on search input
  function filterTags(searchTerm) {
    if (!searchTerm) {
      renderTags(allTags)
      return
    }

    const filteredTags = allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    renderTags(filteredTags)
  }

  // Generate mock tags for demo purposes
  function generateMockTags(count) {
    const tags = []
    const tagNames = [
      "javascript",
      "python",
      "java",
      "c#",
      "php",
      "android",
      "html",
      "jquery",
      "css",
      "ios",
      "mysql",
      "sql",
      "node.js",
      "arrays",
      "c++",
      "ruby-on-rails",
      "json",
      "swift",
      "django",
      "reactjs",
      "angular",
      "excel",
      "regex",
      "pandas",
      "ruby",
      "iphone",
      "ajax",
      "linux",
      "xml",
      "asp.net",
      "spring",
      "git",
      "docker",
      "algorithm",
      "macos",
      "bash",
      "database",
      "mongodb",
      "vba",
      "postgresql",
      "twitter-bootstrap",
      "oracle",
      "python-3.x",
      "windows",
      "flask",
      "laravel",
      "typescript",
      "vue.js",
      "firebase",
      "api",
    ]

    const descriptions = [
      "A high-level, interpreted programming language.",
      "A general-purpose programming language.",
      "A markup language used for creating web pages.",
      "A stylesheet language used for describing the presentation of a document.",
      "A JavaScript library designed to simplify HTML DOM tree traversal and manipulation.",
      "A JavaScript library for building user interfaces.",
      "A server-side web application framework.",
      "A cross-platform JavaScript runtime environment.",
      "A relational database management system.",
      "A NoSQL database program.",
      "A version control system for tracking changes in source code.",
      "A platform for containerized applications.",
      "A collection of data organized in a structured format.",
      "A set of rules for solving a problem in a finite number of steps.",
      "A front-end web framework for building responsive, mobile-first sites.",
      "A platform for building mobile applications.",
      "A query language for your API.",
      "A cloud-hosted NoSQL database.",
    ]

    for (let i = 0; i < count; i++) {
      const tagName = tagNames[i % tagNames.length]
      tags.push({
        name: tagName,
        description: descriptions[i % descriptions.length],
        count: Math.floor(Math.random() * 10000) + 100,
        today_count: Math.floor(Math.random() * 20),
      })
    }

    return tags
  }

  // Modal functions
  function openModal(modal) {
    modal.style.display = "block"
  }

  function closeModal(modal) {
    modal.style.display = "none"
  }

  // Event listeners

  // Tag filter input
  tagFilter.addEventListener("input", function () {
    filterTags(this.value.trim())
  })

  // Modal close buttons
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      closeModal(this.closest(".modal"))
    })
  })

  // Switch between login and signup
  switchToSignup.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(loginModal)
    openModal(signupModal)
  })

  switchToLogin.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(signupModal)
    openModal(loginModal)
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target)
    }
  })

  // Form submissions
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    // In a real app, you would send a request to your API
    console.log("Login attempt:", { email, password })

    // Simulate successful login
    localStorage.setItem("authToken", "fake-token-for-demo")
    isAuthenticated = true
    updateAuthUI()
    closeModal(loginModal)
  })

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const displayName = document.getElementById("signup-display-name").value
    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value

    // In a real app, you would send a request to your API
    console.log("Signup attempt:", { displayName, email, password })

    // Simulate successful signup and login
    localStorage.setItem("authToken", "fake-token-for-demo")
    isAuthenticated = true
    updateAuthUI()
    closeModal(signupModal)
  })

  // Initialize the page
  checkAuthentication()
  fetchTags(currentPage)
})

