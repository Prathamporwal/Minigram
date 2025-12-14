const API = "http://localhost:5000";
const token = localStorage.getItem("token");
const historyDiv = document.getElementById("history");

fetch(API + "/history", {
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
      <small>Viewed at: ${p.viewed_at}</small>
    `;

    historyDiv.appendChild(div);
  });
});
