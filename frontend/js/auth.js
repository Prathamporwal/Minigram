const API = "http://localhost:5000";

function login() {
  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.token);
    window.location = "feed.html";
  });
}

function signup() {
  fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: s_username.value,
      email: s_email.value,
      password: s_password.value
    })
  })
  .then(res => res.text())
  .then(alert);
}
