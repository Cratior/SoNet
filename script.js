const form = document.querySelector('#post-form');
const postsContainer = document.querySelector('#posts-container');

// Function to handle form submission
const handleFormSubmit = async (event) => {
  event.preventDefault();
  
  // Get form data
  const title = document.querySelector('#post-title').value;
  const text = document.querySelector('#post-text').value;
  const image = document.querySelector('#post-image').value;
  const link = document.querySelector('#post-link').value;
  
  // Create new post object
  const newPost = { title, text, image, link };
  
  // Fetch existing posts from GitHub
  const response = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/posts.json');
  const data = await response.json();
  
  // Decode existing posts from base64 and parse JSON
  const decodedData = JSON.parse(atob(data.content));
  
  // Add new post to existing posts
  decodedData.push(newPost);
  
  // Encode updated posts as base64
  const encodedData = btoa(JSON.stringify(decodedData));
  
  // Send updated file to GitHub
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_GITHUB_TOKEN'
    },
    body: JSON.stringify({
      message: 'Add new post',
      content: encodedData,
      sha: data.sha
    })
  };
  const updateResponse = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/posts.json', options);
  
  // Clear form inputs
  document.querySelector('#post-title').value = '';
  document.querySelector('#post-text').value = '';
  document.querySelector('#post-image').value = '';
  document.querySelector('#post-link').value = '';
  
  // Refresh posts
  loadPosts();
};

// Function to load posts from GitHub
const loadPosts = async () => {
  const response = await fetch('https://api.github.com/repos/Cratior//contents/posts.json');
  const data = await response.json();
  const decodedData = JSON.parse(atob(data.content));
  renderPosts(decodedData);
};

// Function to render posts on page
const renderPosts = (posts) => {
  postsContainer.innerHTML = '';
  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.text}</p>
      <img src="${post.image}" alt="Post Image">
      <a href="${post.link}">Read more</a>
    `;
    postsContainer.appendChild(postDiv);
  });
};

// Load posts on page load
loadPosts();

// Add form submit event listener
form.addEventListener('submit', handleFormSubmit);
