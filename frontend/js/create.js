const API = "http://localhost:5000";
const token = localStorage.getItem("token");

function createPost() {
  const image = document.getElementById("image").value;
  const caption = document.getElementById("caption").value;

  fetch(API + "/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token
    },
    body: JSON.stringify({
      image_url: image,
      caption: caption
    })
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    window.location.href = "feed.html";
  });
}
