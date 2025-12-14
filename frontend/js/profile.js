const API = "http://localhost:5000";
const token = localStorage.getItem("token");

// load profile info
fetch(API + "/me", {
  headers: { authorization: token }
})
.then(res => res.json())
.then(data => {
  username.innerText = data.user.username;
  email.innerText = data.user.email;
  posts.innerText = data.posts;
  followers.innerText = data.followers;
  following.innerText = data.following;

  profilePic.src = data.user.profile_pic || "https://via.placeholder.com/120";
});

// update photo
function updatePhoto() {
  fetch(API + "/profile/photo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token
    },
    body: JSON.stringify({
      profile_pic: photoInput.value
    })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    location.reload();
  });
}

// load my posts
fetch(API + "/myposts", {
  headers: { authorization: token }
})
.then(res => res.json())
.then(list => {
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <img src="${p.image_url}">
      <p>${p.caption}</p>
    `;
    myPosts.appendChild(div);
  });
});
