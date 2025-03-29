document.addEventListener("DOMContentLoaded", () => {
  // API base URL - replace with your actual API endpoint
  const API_BASE_URL = "/"

  // DOM elements
  const questionsContainer = document.getElementById("questions-container")
  const popularTagsContainer = document.getElementById("popular-tags")
  const paginationContainer = document.getElementById("pagination")
  const filterButtons = document.querySelectorAll(".filter-btn")

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
  const searchForm = document.getElementById("search-form")

  // Current state
  let currentPage = 1
  let currentFilter = "newest"
  let isAuthenticated = false // Will be set based on auth check

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

  // Fetch questions from API
  async function fetchQuestions(page = 1, filter = "newest", search = "") {
    questionsContainer.innerHTML = '<div class="loading-spinner">Loading questions...</div>'

    try {
      let url = `${API_BASE_URL}/questions/?page=${page}&ordering=`

      // Set ordering based on filter
      switch (filter) {
        case "newest":
          url += "-created_at"
          break
        case "active":
          url += "-last_activity"
          break
        case "unanswered":
          url += "-created_at&answered=false"
          break
        default:
          url += "-created_at"
      }

      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      // For demo purposes, we'll simulate API response
      // In a real app, you would use fetch:
      // const response = await fetch(url);
      // const data = await response.json();

      // Simulated API response
      const data = {
        results: generateMockQuestions(10),
        count: 100,
        next: page < 10 ? `${API_BASE_URL}/questions/?page=${page + 1}` : null,
        previous: page > 1 ? `${API_BASE_URL}/questions/?page=${page - 1}` : null,
      }

      renderQuestions(data.results)
      renderPagination(page, Math.ceil(data.count / 10))
    } catch (error) {
      console.error("Error fetching questions:", error)
      questionsContainer.innerHTML =
        '<div class="error-message">Failed to load questions. Please try again later.</div>'
    }
  }

  // Fetch popular tags
  async function fetchPopularTags() {
    try {
      // In a real app, you would fetch from API
      // const response = await fetch(`${API_BASE_URL}/tags/?ordering=-count&limit=10`);
      // const data = await response.json();

      // Simulated API response
      const data = {
        results: [
          { name: "javascript", count: 1842 },
          { name: "python", count: 1256 },
          { name: "react", count: 954 },
          { name: "django", count: 842 },
          { name: "html", count: 765 },
          { name: "css", count: 687 },
          { name: "node.js", count: 542 },
          { name: "sql", count: 498 },
          { name: "api", count: 421 },
          { name: "docker", count: 387 },
        ],
      }

      renderTags(data.results)
    } catch (error) {
      console.error("Error fetching tags:", error)
      popularTagsContainer.innerHTML = '<div class="error-message">Failed to load tags.</div>'
    }
  }

  // Render questions to DOM
  function renderQuestions(questions) {
    if (!questions || questions.length === 0) {
      questionsContainer.innerHTML = '<div class="no-results">No questions found matching your criteria.</div>'
      return
    }

    let html = ""

    questions.forEach((question) => {
      html += `
                <div class="question-item">
                    <div class="question-stats">
                        <div class="stat">
                            <div class="stat-number">${question.votes}</div>
                            <div class="stat-label">votes</div>
                        </div>
                        <div class="stat ${question.answers > 0 ? "has-answers" : ""}">
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
                                ${question.tags.map((tag) => `<a href="tags.html?tag=${tag}" class="tag">${tag}</a>`).join("")}
                            </div>
                            <div class="question-user">
                                <img src="${question.user.avatar}" alt="${question.user.name}" class="user-avatar">
                                <span>${question.user.name}</span>
                                <span>asked ${formatDate(question.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
    })

    questionsContainer.innerHTML = html
  }

  // Render tags to DOM
  function renderTags(tags) {
    if (!tags || tags.length === 0) {
      popularTagsContainer.innerHTML = '<div class="no-results">No tags found.</div>'
      return
    }

    let html = ""

    tags.forEach((tag) => {
      html += `<a href="tags.html?tag=${tag.name}" class="tag">${tag.name} <span class="tag-count">×${tag.count}</span></a>`
    })

    popularTagsContainer.innerHTML = html
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
        fetchQuestions(page, currentFilter)
        window.scrollTo(0, 0)
      })
    })
  }

  // Format date to relative time (e.g., "2 hours ago")
  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
    }

    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
  }

  // Generate mock questions for demo purposes
  function generateMockQuestions(count) {
    const questions = []

    for (let i = 1; i <= count; i++) {
      questions.push({
        id: i,
        title: `How to implement ${i % 2 === 0 ? "authentication" : "pagination"} in a ${i % 3 === 0 ? "Django" : "React"} application?`,
        excerpt: `I'm trying to build a ${i % 3 === 0 ? "Django" : "React"} application and I need to implement ${i % 2 === 0 ? "user authentication" : "pagination for my list view"}. I've tried several approaches but none of them seem to work correctly. Can someone help me understand the best practice for this?`,
        votes: Math.floor(Math.random() * 50),
        answers: Math.floor(Math.random() * 5),
        views: Math.floor(Math.random() * 1000) + 100,
        tags: i % 3 === 0 ? ["django", "python", "authentication"] : ["react", "javascript", "pagination"],
        user: {
          name: `user${i}`,
          avatar: `/placeholder.svg?height=32&width=32`,
        },
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      })
    }

    return questions
  }

  // Modal functions
  function openModal(modal) {
    modal.style.display = "block"
  }

  function closeModal(modal) {
    modal.style.display = "none"
  }

  // Event listeners

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.dataset.filter

      // Update active class
      filterButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      // Update current filter and fetch questions
      currentFilter = filter
      currentPage = 1
      fetchQuestions(currentPage, currentFilter)
    })
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

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const searchQuery = document.getElementById("search-input").value.trim()
    if (searchQuery) {
      currentPage = 1
      fetchQuestions(currentPage, currentFilter, searchQuery)
    }
  })

  // Ask Question button
  document.getElementById("ask-question").addEventListener("click", () => {
    if (isAuthenticated) {
      window.location.href = "ask-question.html"
    } else {
      openModal(loginModal)
    }
  })

  // Initialize the page
  checkAuthentication()
  fetchQuestions(currentPage, currentFilter)
  fetchPopularTags()
})

