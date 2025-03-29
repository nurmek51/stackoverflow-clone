"use client"

document.addEventListener("DOMContentLoaded", () => {
  // API base URL - replace with your actual API endpoint
  const API_BASE_URL = "/"

  // DOM elements
  const questionHeader = document.getElementById("question-header")
  const questionContent = document.getElementById("question-content")
  const questionAuthor = document.getElementById("question-author")
  const questionComments = document.getElementById("question-comments")
  const answersContainer = document.getElementById("answers-container")
  const answersCount = document.getElementById("answers-count")
  const relatedTagsContainer = document.getElementById("related-tags")
  const questionVotes = document.getElementById("question-votes")

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
  const answerForm = document.getElementById("post-answer-btn")

  // Get question ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const questionId = urlParams.get("id")

  // Current state
  let isAuthenticated = false // Will be set based on auth check
  let currentQuestion = null
  let currentAnswers = []

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

  // Fetch question details
  async function fetchQuestionDetails() {
    if (!questionId) {
      window.location.href = "index.html"
      return
    }

    try {
      // In a real app, you would fetch from API
      // const response = await fetch(`${API_BASE_URL}/questions/${questionId}/`);
      // const data = await response.json();

      // Simulated API response
      const data = generateMockQuestion(questionId)

      currentQuestion = data
      document.title = `${data.title} - DevOverflow`

      renderQuestionHeader(data)
      renderQuestionContent(data)
      renderQuestionAuthor(data)
      renderQuestionComments(data.comments)
      fetchRelatedTags(data.tags)

      // Update vote count
      questionVotes.textContent = data.votes

      // Fetch answers
      fetchAnswers()
    } catch (error) {
      console.error("Error fetching question details:", error)
      questionHeader.innerHTML = '<div class="error-message">Failed to load question. Please try again later.</div>'
    }
  }

  // Fetch answers for the question
  async function fetchAnswers() {
    try {
      // In a real app, you would fetch from API
      // const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers/`);
      // const data = await response.json();

      // Simulated API response
      const data = {
        count: Math.floor(Math.random() * 5) + 1,
        results: generateMockAnswers(questionId, Math.floor(Math.random() * 5) + 1),
      }

      currentAnswers = data.results
      answersCount.textContent = data.count

      renderAnswers(data.results)
    } catch (error) {
      console.error("Error fetching answers:", error)
      answersContainer.innerHTML = '<div class="error-message">Failed to load answers. Please try again later.</div>'
    }
  }

  // Fetch related tags
  async function fetchRelatedTags(tags) {
    try {
      // In a real app, you would fetch from API
      // const response = await fetch(`${API_BASE_URL}/tags/?names=${tags.join(',')}`);
      // const data = await response.json();

      // Simulated API response - just use the tags from the question
      const data = {
        results: tags.map((tag) => ({ name: tag, count: Math.floor(Math.random() * 1000) + 100 })),
      }

      renderRelatedTags(data.results)
    } catch (error) {
      console.error("Error fetching related tags:", error)
      relatedTagsContainer.innerHTML = '<div class="error-message">Failed to load tags.</div>'
    }
  }

  // Render question header
  function renderQuestionHeader(question) {
    const date = new Date(question.created_at)
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    questionHeader.innerHTML = `
            <div class="question-title-header">
                <h1>${question.title}</h1>
                <button id="ask-question" class="btn btn-primary">Ask Question</button>
            </div>
            <div class="question-info">
                <div class="question-stats-summary">
                    <div class="question-stat">
                        <span>Asked</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="question-stat">
                        <span>Viewed</span>
                        <span>${question.views} times</span>
                    </div>
                </div>
            </div>
        `

    // Add event listener to Ask Question button
    document.getElementById("ask-question").addEventListener("click", () => {
      if (isAuthenticated) {
        window.location.href = "ask-question.html"
      } else {
        openModal(loginModal)
      }
    })
  }

  // Render question content
  function renderQuestionContent(question) {
    questionContent.innerHTML = `
            <div class="post-content">
                ${question.content}
            </div>
            <div class="post-tags">
                ${question.tags.map((tag) => `<a href="tags.html?tag=${tag}" class="tag">${tag}</a>`).join("")}
            </div>
        `
  }

  // Render question author
  function renderQuestionAuthor(question) {
    const date = new Date(question.created_at)
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    questionAuthor.innerHTML = `
            <div class="author-card">
                <img src="${question.user.avatar}" alt="${question.user.name}" class="author-avatar">
                <div class="author-info">
                    <div class="author-action">asked ${formattedDate}</div>
                    <div class="author-name">${question.user.name}</div>
                    <div class="author-reputation">${question.user.reputation}</div>
                </div>
            </div>
        `
  }

  // Render question comments
  function renderQuestionComments(comments) {
    if (!comments || comments.length === 0) {
      return
    }

    let html = ""

    comments.forEach((comment) => {
      const date = new Date(comment.created_at)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      html += `
                <div class="comment">
                    <div class="comment-text">${comment.text}</div>
                    <span class="comment-user">${comment.user.name}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
            `
    })

    // Insert comments before the add comment form
    const addCommentDiv = questionComments.querySelector(".add-comment")
    const commentsDiv = document.createElement("div")
    commentsDiv.className = "comments-list"
    commentsDiv.innerHTML = html
    questionComments.insertBefore(commentsDiv, addCommentDiv)
  }

  // Render answers
  function renderAnswers(answers) {
    if (!answers || answers.length === 0) {
      answersContainer.innerHTML = '<div class="no-answers">No answers yet. Be the first to answer this question!</div>'
      return
    }

    let html = ""

    answers.forEach((answer) => {
      const date = new Date(answer.created_at)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      html += `
                <div class="answer ${answer.is_accepted ? "accepted-answer" : ""}">
                    <div class="post-layout">
                        <div class="vote-cell">
                            ${answer.is_accepted ? '<div class="accepted-checkmark" title="This answer is accepted"><i class="fas fa-check"></i></div>' : ""}
                            <button class="vote-button upvote" title="This answer is useful"><i class="fas fa-caret-up"></i></button>
                            <div class="vote-count">${answer.votes}</div>
                            <button class="vote-button downvote" title="This answer is not useful"><i class="fas fa-caret-down"></i></button>
                        </div>
                        
                        <div class="post-cell">
                            <div class="post-content">
                                ${answer.content}
                            </div>
                        </div>
                        
                        <div class="post-author">
                            <div class="author-card">
                                <img src="${answer.user.avatar}" alt="${answer.user.name}" class="author-avatar">
                                <div class="author-info">
                                    <div class="author-action">answered ${formattedDate}</div>
                                    <div class="author-name">${answer.user.name}</div>
                                    <div class="author-reputation">${answer.user.reputation}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comments-container">
                        ${renderAnswerComments(answer.comments)}
                        <div class="add-comment">
                            <textarea placeholder="Add a comment..." class="answer-comment-input" data-answer-id="${answer.id}"></textarea>
                            <button class="btn btn-sm add-answer-comment-btn" data-answer-id="${answer.id}">Add Comment</button>
                        </div>
                    </div>
                </div>
            `
    })

    answersContainer.innerHTML = html

    // Add event listeners to vote buttons
    document.querySelectorAll(".vote-button").forEach((btn) => {
      btn.addEventListener("click", handleVote)
    })

    // Add event listeners to comment buttons
    document.querySelectorAll(".add-answer-comment-btn").forEach((btn) => {
      btn.addEventListener("click", handleAddAnswerComment)
    })
  }

  // Render answer comments
  function renderAnswerComments(comments) {
    if (!comments || comments.length === 0) {
      return ""
    }

    let html = '<div class="comments-list">'

    comments.forEach((comment) => {
      const date = new Date(comment.created_at)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      html += `
                <div class="comment">
                    <div class="comment-text">${comment.text}</div>
                    <span class="comment-user">${comment.user.name}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
            `
    })

    html += "</div>"
    return html
  }

  // Render related tags
  function renderRelatedTags(tags) {
    if (!tags || tags.length === 0) {
      relatedTagsContainer.innerHTML = '<div class="no-tags">No related tags found.</div>'
      return
    }

    let html = ""

    tags.forEach((tag) => {
      html += `<a href="tags.html?tag=${tag.name}" class="tag">${tag.name} <span class="tag-count">×${tag.count}</span></a>`
    })

    relatedTagsContainer.innerHTML = html
  }

  // Handle voting
  function handleVote() {
    if (!isAuthenticated) {
      openModal(loginModal)
      return
    }

    const isUpvote = this.classList.contains("upvote")
    const voteCountElement = this.parentElement.querySelector(".vote-count")
    const currentVotes = Number.parseInt(voteCountElement.textContent)

    // Check if already voted
    if (this.classList.contains("voted")) {
      // Remove vote
      this.classList.remove("voted")
      voteCountElement.textContent = isUpvote ? currentVotes - 1 : currentVotes + 1
    } else {
      // Add vote
      this.classList.add("voted")

      // Remove opposite vote if exists
      const oppositeBtn = this.parentElement.querySelector(isUpvote ? ".downvote" : ".upvote")
      if (oppositeBtn.classList.contains("voted")) {
        oppositeBtn.classList.remove("voted")
        voteCountElement.textContent = isUpvote ? currentVotes + 2 : currentVotes - 2
      } else {
        voteCountElement.textContent = isUpvote ? currentVotes + 1 : currentVotes - 1
      }
    }

    // In a real app, you would send a request to your API
    console.log(`${isUpvote ? "Upvoted" : "Downvoted"} post`)
  }

  // Handle adding comment to question
  document.getElementById("add-question-comment").addEventListener("click", () => {
    if (!isAuthenticated) {
      openModal(loginModal)
      return
    }

    const commentText = document.getElementById("question-comment-input").value.trim()
    if (!commentText) {
      return
    }

    // In a real app, you would send a request to your API
    console.log("Adding comment to question:", commentText)

    // Simulate adding comment
    const newComment = {
      id: Date.now(),
      text: commentText,
      created_at: new Date().toISOString(),
      user: {
        name: "Current User",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    }

    // Add to UI
    const commentsListDiv = questionComments.querySelector(".comments-list") || document.createElement("div")
    if (!questionComments.querySelector(".comments-list")) {
      commentsListDiv.className = "comments-list"
      questionComments.insertBefore(commentsListDiv, document.getElementById("question-comment-input").parentElement)
    }

    const commentDiv = document.createElement("div")
    commentDiv.className = "comment"
    commentDiv.innerHTML = `
            <div class="comment-text">${newComment.text}</div>
            <span class="comment-user">${newComment.user.name}</span>
            <span class="comment-date">just now</span>
        `

    commentsListDiv.appendChild(commentDiv)

    // Clear input
    document.getElementById("question-comment-input").value = ""
  })

  // Handle adding comment to answer
  function handleAddAnswerComment() {
    if (!isAuthenticated) {
      openModal(loginModal)
      return
    }

    const answerId = this.dataset.answerId
    const commentInput = document.querySelector(`.answer-comment-input[data-answer-id="${answerId}"]`)
    const commentText = commentInput.value.trim()

    if (!commentText) {
      return
    }

    // In a real app, you would send a request to your API
    console.log(`Adding comment to answer ${answerId}:`, commentText)

    // Simulate adding comment
    const newComment = {
      id: Date.now(),
      text: commentText,
      created_at: new Date().toISOString(),
      user: {
        name: "Current User",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    }

    // Add to UI
    const answerElement = this.closest(".answer")
    let commentsListDiv = answerElement.querySelector(".comments-list")

    if (!commentsListDiv) {
      commentsListDiv = document.createElement("div")
      commentsListDiv.className = "comments-list"
      answerElement.querySelector(".comments-container").insertBefore(commentsListDiv, this.parentElement)
    }

    const commentDiv = document.createElement("div")
    commentDiv.className = "comment"
    commentDiv.innerHTML = `
            <div class="comment-text">${newComment.text}</div>
            <span class="comment-user">${newComment.user.name}</span>
            <span class="comment-date">just now</span>
        `

    commentsListDiv.appendChild(commentDiv)

    // Clear input
    commentInput.value = ""
  }

  // Handle posting an answer
  document.getElementById("post-answer-btn").addEventListener("click", () => {
    if (!isAuthenticated) {
      openModal(loginModal)
      return
    }

    const answerText = document.getElementById("answer-editor").value.trim()
    if (!answerText) {
      alert("Please enter your answer before posting.")
      return
    }

    // In a real app, you would send a request to your API
    console.log("Posting answer:", answerText)

    // Simulate posting answer
    const newAnswer = {
      id: Date.now(),
      content: answerText.replace(/\n/g, "<br>"),
      votes: 0,
      is_accepted: false,
      created_at: new Date().toISOString(),
      user: {
        name: "Current User",
        avatar: "/placeholder.svg?height=32&width=32",
        reputation: 1,
      },
      comments: [],
    }

    // Add to current answers
    currentAnswers.push(newAnswer)

    // Update answers count
    const count = Number.parseInt(answersCount.textContent) + 1
    answersCount.textContent = count

    // Re-render answers
    renderAnswers(currentAnswers)

    // Clear editor
    document.getElementById("answer-editor").value = ""

    // Scroll to the new answer
    window.scrollTo(0, document.body.scrollHeight)
  })

  // Modal functions
  function openModal(modal) {
    modal.style.display = "block"
  }

  function closeModal(modal) {
    modal.style.display = "none"
  }

  // Generate mock question for demo purposes
  function generateMockQuestion(id) {
    const tags = ["javascript", "react", "django", "python", "html", "css"].sort(() => 0.5 - Math.random()).slice(0, 3)
    const isJavascript = tags.includes("javascript") || tags.includes("react")

    return {
      id: id,
      title: isJavascript
        ? "How to properly handle state in React functional components?"
        : "Django REST Framework serializer validation best practices",
      content: isJavascript
        ? `<p>I'm building a React application and I'm having trouble with state management in functional components. I've been using the useState hook, but I'm not sure if I'm doing it correctly.</p>
                   <p>Here's my current code:</p>
                   <pre><code>function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  const handleIncrement = () => {
    setCount(count + 1);
  };
  
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  return (
    &lt;div&gt;
      &lt;p&gt;Count: {count}&lt;/p&gt;
      &lt;button onClick={handleIncrement}&gt;Increment&lt;/button&gt;
      &lt;input value={name} onChange={handleNameChange} /&gt;
    &lt;/div&gt;
  );
}</code></pre>
                   <p>Is this the correct way to handle multiple state variables? Should I be using useReducer instead? What are the best practices for state management in functional components?</p>`
        : `<p>I'm working on a Django REST Framework API and I'm trying to implement proper validation for my serializers. I want to ensure that the data is validated correctly before it's saved to the database.</p>
                   <p>Here's my current serializer:</p>
                   <pre><code>class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user</code></pre>
                   <p>How can I add custom validation to ensure that the password meets certain requirements? Should I be using validate_password or validate methods? What's the best approach for handling complex validation logic?</p>`,
      votes: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      tags: tags,
      user: {
        name: `user${id}`,
        avatar: `/placeholder.svg?height=32&width=32`,
        reputation: Math.floor(Math.random() * 10000) + 1,
      },
      comments: generateMockComments(3),
    }
  }

  // Generate mock answers for demo purposes
  function generateMockAnswers(questionId, count) {
    const answers = []

    for (let i = 1; i <= count; i++) {
      const isAccepted = i === 1 // First answer is accepted

      answers.push({
        id: `${questionId}-${i}`,
        content:
          i === 1
            ? `<p>Based on your code, you're actually using React hooks correctly for managing state in functional components.</p>
                       <p>Using multiple <code>useState</code> hooks is a perfectly valid approach when you have several independent state variables. Here's why your approach is good:</p>
                       <ul>
                         <li>Each state variable has a clear, specific purpose</li>
                         <li>The update functions are simple and focused</li>
                         <li>The code is readable and easy to understand</li>
                       </ul>
                       <p>You should consider using <code>useReducer</code> instead of <code>useState</code> when:</p>
                       <ul>
                         <li>You have complex state logic that involves multiple sub-values</li>
                         <li>The next state depends on the previous state</li>
                         <li>You need to update multiple state values together</li>
                       </ul>
                       <p>For your current example, <code>useState</code> is perfectly appropriate. If your component grows more complex, you might want to reconsider.</p>`
            : `<p>While the other answer is correct that your code is using hooks properly, I'd like to add a few best practices:</p>
                       <p>1. When updating state based on previous state, use the functional update form:</p>
                       <pre><code>const handleIncrement = () => {
  setCount(prevCount => prevCount + 1);
};</code></pre>
                       <p>2. For complex forms, consider using a single state object:</p>
                       <pre><code>const [formData, setFormData] = useState({ count: 0, name: '' });

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};</code></pre>
                       <p>3. Extract complex logic into custom hooks for reusability.</p>
                       <p>These patterns will help your code scale better as your components grow more complex.</p>`,
        votes: Math.floor(Math.random() * 20) + (isAccepted ? 10 : 0),
        is_accepted: isAccepted,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        user: {
          name: `user${Math.floor(Math.random() * 100)}`,
          avatar: `/placeholder.svg?height=32&width=32`,
          reputation: Math.floor(Math.random() * 10000) + 1,
        },
        comments: generateMockComments(Math.floor(Math.random() * 3)),
      })
    }

    return answers
  }

  // Generate mock comments for demo purposes
  function generateMockComments(count) {
    const comments = []

    for (let i = 1; i <= count; i++) {
      comments.push({
        id: i,
        text:
          i % 2 === 0
            ? "Thanks for the detailed explanation, this really helped me understand the concept better!"
            : "Could you provide an example of how to implement this in a real-world application?",
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        user: {
          name: `user${Math.floor(Math.random() * 100)}`,
          avatar: `/placeholder.svg?height=32&width=32`,
        },
      })
    }

    return comments
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
  fetchQuestionDetails()
})

