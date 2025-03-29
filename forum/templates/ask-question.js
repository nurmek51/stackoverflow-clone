document.addEventListener("DOMContentLoaded", () => {
  // API base URL - replace with your actual API endpoint
  const API_BASE_URL = "/api"

  // DOM elements
  const askQuestionForm = document.getElementById("ask-question-form")
  const questionTitle = document.getElementById("question-title")
  const questionBody = document.getElementById("question-body")
  const questionTags = document.getElementById("question-tags")
  const tagsContainer = document.getElementById("tags-container")
  const discardBtn = document.getElementById("discard-btn")

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
  let isAuthenticated = false // Will be set based on auth check
  let currentTags = []

  // Check if user is authenticated
  function checkAuthentication() {
    // In a real app, you would check for a token in localStorage or cookies
    const token = localStorage.getItem("authToken")
    if (token) {
      isAuthenticated = true
      updateAuthUI()
    } else {
      // Redirect to login if not authenticated
      openModal(loginModal)
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
    // Redirect to home page after logout
    window.location.href = "index.html"
  }

  // Handle adding tags
  questionTags.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()

      const tagText = this.value.trim()
      if (tagText && !currentTags.includes(tagText) && currentTags.length < 5) {
        addTag(tagText)
        this.value = ""
      }
    }
  })

  // Add a tag to the UI
  function addTag(tagText) {
    currentTags.push(tagText)

    const tagElement = document.createElement("div")
    tagElement.className = "tag-item"
    tagElement.innerHTML = `
            ${tagText}
            <span class="remove-tag" data-tag="${tagText}">&times;</span>
        `

    tagsContainer.appendChild(tagElement)

    // Add event listener to remove tag
    tagElement.querySelector(".remove-tag").addEventListener("click", function () {
      const tag = this.dataset.tag
      removeTag(tag)
    })
  }

  // Remove a tag from the UI
  function removeTag(tagText) {
    currentTags = currentTags.filter((tag) => tag !== tagText)

    const tagElements = tagsContainer.querySelectorAll(".tag-item")
    tagElements.forEach((element) => {
      if (element.textContent.trim().replace("×", "") === tagText) {
        element.remove()
      }
    })
  }

  // Handle form submission
  askQuestionForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      openModal(loginModal)
      return
    }

    const title = questionTitle.value.trim()
    const body = questionBody.value.trim()

    if (!title || !body) {
      alert("Please fill in all required fields.")
      return
    }

    // Prepare data for API
    const questionData = {
      title: title,
      body: body,
      tags: currentTags,
    }

    // In a real app, you would send a request to your API
    console.log("Submitting question:", questionData)

    // Simulate successful submission
    alert("Your question has been posted successfully!")

    // Redirect to the question page (in a real app, you would redirect to the newly created question)
    window.location.href = "index.html"
  })

  // Handle discard button
  discardBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to discard this question? All progress will be lost.")) {
      window.location.href = "index.html"
    }
  })

  // Editor toolbar functionality
  document.querySelectorAll(".toolbar-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const editor = document.getElementById("question-body")
      const selection = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      let replacement = ""

      switch (this.title) {
        case "Bold":
          replacement = `**${selection}**`
          break
        case "Italic":
          replacement = `*${selection}*`
          break
        case "Code":
          replacement = selection.includes("\n") ? `\`\`\`\n${selection}\n\`\`\`` : `\`${selection}\``
          break
        case "Link":
          replacement = `[${selection}](url)`
          break
        case "Quote":
          replacement = `> ${selection}`
          break
        case "Image":
          replacement = `![${selection}](image-url)`
          break
        default:
          replacement = selection
      }

      // Insert the replacement text
      editor.focus()
      document.execCommand("insertText", false, replacement)
    })
  })

  // Modal functions
  function openModal(modal) {
    modal.style.display = "block"
  }

  function closeModal(modal) {
    modal.style.display = "none"
  }

  // Event listeners

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
})

