const BIN_URL = "https://cors-anywhere.herokuapp.com/https://api.jsonbin.io/v3/b/642040aface6f33a22fce4b5";
const API_KEY = "$2b$10$0DjS24xl07wRHutzdPvEUOI1H/2dzsCUVg9iDb.unyBAJKITYiVEe";
const COOLDOWN_TIME = 10000; // 10 seconds cooldown
const REFRESH_INTERVAL = 1000; // 5 seconds refresh interval
const DEV_KEYWORD = "$DEV@";

let lastPostTime = 0;
const addPostButton = document.getElementById("addPostButton");

// Load existing posts
async function loadPosts() {
  const response = await fetch(BIN_URL, {
    headers: { "X-Master-Key": API_KEY },
  });
  const data = await response.json();
  const posts = data.record;
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  const sortedPostIds = Object.keys(posts).sort((a, b) => b - a); // Sort post IDs in descending order

  for (const postId of sortedPostIds) {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
      <h3>${posts[postId].title}</h3>
      <p>${posts[postId].content}</p>
    `;
    postsDiv.appendChild(postElement);
  }
}

// Add a new post
addPostButton.addEventListener("click", async function () {
  const currentTime = new Date().getTime();
  if (currentTime - lastPostTime < COOLDOWN_TIME) {
    alert("Please wait before posting again.");
    return;
  }

  const postTitle = prompt("Enter your post title:");
  const postContent = prompt("Enter your post content:");
  if (postTitle && postContent) {
    // Check for developer command
    if (postTitle.includes(DEV_KEYWORD)) {
      if (postContent.toLowerCase() === "clear") {
        // Clear all posts and create a new one with "Hi" as title and "Hello World!" as content
        const clearedPosts = {
          [new Date().getTime()]: { title: "Hi", content: "Hello World!" },
        };

        const updateResponse = await fetch(BIN_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY,
            "versioning": "false",
          },
          body: JSON.stringify(clearedPosts),
        });

        if (updateResponse.ok) {
          lastPostTime = currentTime;
          addPostButton.disabled = true;
          setTimeout(() => {
            addPostButton.disabled = false;
          }, COOLDOWN_TIME);
          loadPosts();
        } else {
          alert("Error: Could not clear posts");
        }
      }
      return;
    }

    const postId = new Date().getTime();
    const response = await fetch(BIN_URL, {
      method: "GET",
      headers: { "X-Master-Key": API_KEY },
    });
    const data = await response.json();
    const posts = data.record;
    posts[postId] = { title: postTitle, content: postContent };

    const updateResponse = await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "versioning": "false",
      },
      body: JSON.stringify(posts),
    });

    if (updateResponse.ok) {
      lastPostTime = currentTime;
      addPostButton.disabled = true;
      setTimeout(() => {
        addPostButton.disabled = false;
      }, COOLDOWN_TIME);
      loadPosts();
    } else {
      alert("Error: Could not create post");
    }
  }
});

// Load posts on page load
loadPosts();

// Periodically refresh posts
setInterval(loadPosts, REFRESH_INTERVAL);
