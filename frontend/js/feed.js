const API = "http://localhost:5000";
const token = localStorage.getItem("token");
const feed = document.getElementById("feed");

// load feed
fetch(API + "/feed", {
  headers: { authorization: token }
})
.then(res => res.json())
.then(posts => {
  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <img src="${p.image_url}">
      <p>${p.caption}</p>

      <p id="likes-${p.id}">❤️ 0 likes</p>
      <button onclick="likePost(${p.id})">Like</button>

      <div id="comments-${p.id}"></div>

      <input id="comment-input-${p.id}" placeholder="Add comment">
      <button onclick="addComment(${p.id})">Comment</button>
    `;

    feed.appendChild(div);

    loadLikes(p.id);
    loadComments(p.id);
    recordView(p.id);
  });
});

function likePost(id) {
  fetch(API + "/liked/" + id, {
    headers: { authorization: token }
  })
  .then(res => res.json())
  .then(data => {
    if (data.liked) {
      // unlike
      fetch(API + "/unlike/" + id, {
        method: "POST",
        headers: { authorization: token }
      })
      .then(() => loadLikes(id));
    } else {
      // like
      fetch(API + "/like/" + id, {
        method: "POST",
        headers: { authorization: token }
      })
      .then(() => loadLikes(id));
    }
  });
}


function loadLikes(postId) {
  fetch(API + "/likes/" + postId, {
    headers: { authorization: token }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("likes-" + postId).innerText =
      "❤️ " + data.total + " likes";
  });
}

function loadComments(postId) {
  fetch(API + "/comments/" + postId, {
    headers: { authorization: token }
  })
  .then(res => res.json())
  .then(list => {
    const box = document.getElementById("comments-" + postId);
    box.innerHTML = "";

    list.forEach(c => {
      const p = document.createElement("p");
      p.innerText = c.username + ": " + c.comment;
      box.appendChild(p);
    });
  });
}

function addComment(postId) {
  const text = document.getElementById("comment-input-" + postId).value;

  if (!text) {
    alert("write something");
    return;
  }

  fetch(API + "/comment/" + postId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token
    },
    body: JSON.stringify({ comment: text })
  })
  .then(() => {
    document.getElementById("comment-input-" + postId).value = "";
    loadComments(postId);
  });
}

function recordView(id) {
  fetch(API + "/view/" + id, {
    method: "POST",
    headers: { authorization: token }
  });
}

function search() {
  const name = document.getElementById("searchUser").value;

  if (!name) {
    alert("enter username");
    return;
  }

  fetch(API + "/users?q=" + name, {
    headers: { authorization: token }
  })
  .then(res => res.json())
  .then(users => {
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (users.length === 0) {
      results.innerHTML = "<p>No user found</p>";
      return;
    }

    users.forEach(u => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${u.username}</p>
        <button onclick="follow(${u.id})">Follow</button>
      `;
      results.appendChild(div);
    });
  });
}

function follow(id) {
  fetch(API + "/follow/" + id, {
    method: "POST",
    headers: { authorization: token }
  })
  .then(() => alert("followed"));
}
