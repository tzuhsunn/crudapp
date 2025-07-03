// app.js
const postList = document.getElementById('postList')
const titleInput = document.getElementById('postTitle')
const textInput = document.getElementById('postText')
const createBtn = document.getElementById('createBtn')

// Get all posts
async function fetchPosts() {
  const res = await fetch('/posts')
  const posts = await res.json()
  renderPosts(posts)
}

// Render posts to the list
function renderPosts(posts) {
  postList.innerHTML = ''

  posts.forEach(post => {
    const li = document.createElement('li')

    const titleInput = document.createElement('input')
    titleInput.value = post.title
    titleInput.id = `title-${post._id}`

    const textArea = document.createElement('textarea')
    textArea.value = post.text
    textArea.id = `text-${post._id}`

    const updateBtn = document.createElement('button')
    updateBtn.textContent = 'Update'
    updateBtn.onclick = () => updatePost(post._id)

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.onclick = () => deletePost(post._id)

    li.appendChild(titleInput)
    li.appendChild(document.createElement('br'))
    li.appendChild(textArea)
    li.appendChild(document.createElement('br'))
    li.appendChild(updateBtn)
    li.appendChild(document.createTextNode(' '))
    li.appendChild(deleteBtn)
    li.appendChild(document.createElement('hr'))

    postList.appendChild(li)
  })
}

// Create
async function createPost() {
  const title = titleInput.value.trim()
  const text = textInput.value.trim()
  if (!title || !text) return

  await fetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text })
  })

  titleInput.value = ''
  textInput.value = ''
  fetchPosts()
}

// Update
async function updatePost(id) {
  const title = document.getElementById(`title-${id}`).value
  const text = document.getElementById(`text-${id}`).value

  const res = await fetch(`/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text })
  })

  if (res.ok) {
    alert('✅ Post updated successfully.')
    fetchPosts()
  } else {
    const error = await res.json()
    alert(`❌ Error: ${error.message}`)
  }
}

// Delete
async function deletePost(id) {
  await fetch(`/posts/${id}`, { method: 'DELETE' })
  fetchPosts()
}

createBtn.addEventListener('click', createPost)
fetchPosts()
