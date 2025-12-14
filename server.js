console.log("SERVER FILE LOADED");
const bcrypt = require("bcrypt");
const db = require("./db");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const secret = "secret123";

const app = express();


app.use(cors());
app.use(express.json());

// auth middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    res.send("token required");
    return;
  }

  try {
    const data = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    res.send("invalid token");
  }
}



app.get("/", (req, res) => {
  res.send("backend started");
});


// signup user
app.post("/signup", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    res.send("please fill all fields");
    return;
  }

  const hashedPass = bcrypt.hashSync(password, 10);

  const sql =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(sql, [username, email, hashedPass], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error while signup");
    } else {
      res.send("signup success");
    }
  });
});

// login user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send("email or password missing");
    return;
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      if (result.length === 0) {
        res.send("user not found");
      } else {
        const user = result[0];

        const ok = bcrypt.compareSync(password, user.password);

        if (!ok) {
          res.send("wrong password");
        } else {
          const token = jwt.sign(
            { id: user.id, email: user.email },
            secret
          );

          res.json({
            message: "login success",
            token: token
          });
        }
      }
    }
  });
});

app.get("/profile", auth, (req, res) => {
  console.log("PROFILE ROUTE HIT");
  res.send("hello " + req.user.email);
});

// create post
app.post("/posts", auth, (req, res) => {
  const image_url = req.body.image_url;
  const caption = req.body.caption;
  const user_id = req.user.id;

  if (!image_url) {
    res.send("image required");
    return;
  }

  const sql =
    "INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)";

  db.query(sql, [user_id, image_url, caption], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error creating post");
    } else {
      res.send("post created");
    }
  });
});

// follow user
app.post("/follow/:id", auth, (req, res) => {
  const follower_id = req.user.id;
  const following_id = req.params.id;

  if (follower_id == following_id) {
    res.send("cannot follow yourself");
    return;
  }

  const sql =
    "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";

  db.query(sql, [follower_id, following_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error following user");
    } else {
      res.send("followed");
    }
  });
});


// unfollow user
app.post("/unfollow/:id", auth, (req, res) => {
  const follower_id = req.user.id;
  const following_id = req.params.id;

  const sql =
    "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";

  db.query(sql, [follower_id, following_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error unfollowing");
    } else {
      res.send("unfollowed");
    }
  });
});


// user feed 
app.get("/feed", auth, (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT * FROM posts
    WHERE user_id = ?
    OR user_id IN (
      SELECT following_id FROM follows WHERE follower_id = ?
    )
    ORDER BY id DESC
  `;

  db.query(sql, [user_id, user_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error loading feed");
    } else {
      res.json(result);
    }
  });
});


// like post
app.post("/like/:postId", auth, (req, res) => {
  const user_id = req.user.id;
  const post_id = req.params.postId;

  const sql =
    "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";

  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error liking post");
    } else {
      res.send("liked");
    }
  });
});


// unlike post
app.post("/unlike/:postId", auth, (req, res) => {
  const user_id = req.user.id;
  const post_id = req.params.postId;

  const sql =
    "DELETE FROM likes WHERE user_id = ? AND post_id = ?";

  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error unliking post");
    } else {
      res.send("unliked");
    }
  });
});


// add comment
app.post("/comment/:postId", auth, (req, res) => {
  const user_id = req.user.id;
  const post_id = req.params.postId;
  const text = req.body.comment;

  if (!text) {
    res.send("comment required");
    return;
  }

  const sql =
    "INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)";

  db.query(sql, [user_id, post_id, text], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error adding comment");
    } else {
      res.send("comment added");
    }
  });
});


// record post view
app.post("/view/:postId", auth, (req, res) => {
  const user_id = req.user.id;
  const post_id = req.params.postId;

  const sql =
    "INSERT INTO post_views (user_id, post_id) VALUES (?, ?)";

  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error recording view");
    } else {
      res.send("view recorded");
    }
  });
});


// recently viewed posts (unique)
app.get("/history", auth, (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT posts.id, posts.image_url, posts.caption, MAX(post_views.viewed_at) as viewed_at
    FROM post_views
    JOIN posts ON post_views.post_id = posts.id
    WHERE post_views.user_id = ?
    GROUP BY posts.id
    ORDER BY viewed_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("error loading history");
    } else {
      res.json(result);
    }
  });
});



// search users
app.get("/users", auth, (req, res) => {
  const q = req.query.q;

  const sql = "SELECT id, username FROM users WHERE username LIKE ?";

  db.query(sql, ["%" + q + "%"], (err, result) => {
    if (err) {
      res.send("error searching users");
    } else {
      res.json(result);
    }
  });
});


// my profile
app.get("/me", auth, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, username, email, profile_pic FROM users WHERE id = ?",
    [userId],
    (err, userData) => {
      if (err) {
        console.log(err);
        res.send("error");
        return;
      }

      db.query(
        "SELECT COUNT(*) AS total FROM posts WHERE user_id = ?",
        [userId],
        (err, postData) => {
          if (err) {
            console.log(err);
            res.send("error");
            return;
          }

          db.query(
            "SELECT COUNT(*) AS total FROM follows WHERE following_id = ?",
            [userId],
            (err, followerData) => {
              if (err) {
                console.log(err);
                res.send("error");
                return;
              }

              db.query(
                "SELECT COUNT(*) AS total FROM follows WHERE follower_id = ?",
                [userId],
                (err, followingData) => {
                  if (err) {
                    console.log(err);
                    res.send("error");
                    return;
                  }

                  res.json({
                    user: userData[0],
                    posts: postData[0].total,
                    followers: followerData[0].total,
                    following: followingData[0].total
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// update profile photo
app.post("/profile/photo", auth, (req, res) => {
  const user_id = req.user.id;
  const pic = req.body.profile_pic;

  if (!pic) {
    res.send("image url required");
    return;
  }

  const sql = "UPDATE users SET profile_pic = ? WHERE id = ?";

  db.query(sql, [pic, user_id], (err) => {
    if (err) {
      res.send("error updating photo");
    } else {
      res.send("profile photo updated");
    }
  });
});


// get my posts
app.get("/myposts", auth, (req, res) => {
  const user_id = req.user.id;

  const sql = "SELECT * FROM posts WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      res.send("error fetching posts");
    } else {
      res.json(result);
    }
  });
});


//like cont
app.get("/likes/:postId", auth, (req, res) => {
  const postId = req.params.postId;

  db.query(
    "SELECT COUNT(*) AS total FROM likes WHERE post_id = ?",
    [postId],
    (err, result) => {
      if (err) {
        res.send("error");
      } else {
        res.json(result[0]);
      }
    }
  );
});


// g comments
app.get("/comments/:postId", auth, (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT comments.comment, users.username
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = ?
  `;

  db.query(sql, [postId], (err, result) => {
    if (err) {
      res.send("error");
    } else {
      res.json(result);
    }
  });
});


//liked
app.get("/liked/:postId", auth, (req, res) => {
  const user_id = req.user.id;
  const post_id = req.params.postId;

  const sql = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";

  db.query(sql, [user_id, post_id], (err, result) => {
    if (err) {
      res.send("error");
    } else {
      res.json({ liked: result.length > 0 });
    }
  });
});



const PORT = 5000;

app.listen(PORT, () => {
  console.log("server running on port " + PORT);
});
