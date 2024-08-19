import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
env.config();

// const db = new pg.Client({
//     user: process.env.PG_USER,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: process.env.PG_PORT,
//   });
//   db.connect();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

let startPost = ["No Reminders"];
let posts = [];
let loginemail = [];
let count = 0;
let loginid = [];


async function databaseReminders () {
    const result = await db.query("SELECT * FROM reminder WHERE login_id = $1", [
      loginid[0],
    ]);
    console.log(result);
    result.rows.forEach((subject) => {
      posts.push(subject);
    });
  }

app.post("/registerpage", (req, res) => {
  res.render("register.ejs");
});

app.post("/loginpage", (req, res) => {
  res.render("login.ejs");
});

app.get("/homepage", async (req, res) => {

    if (count === 0) {
     
      const result = await databaseReminders();

      console.log(posts);
      res.render("index.ejs", {
        posts: posts,
        startPost: startPost
    })
    count = 1;
  } else {
    res.render("index.ejs", {
      posts: posts,
      startPost: startPost
  })
  }

});

app.post("/logout", (req, res) => {
  posts = [];
  count = 0;
  loginemail = [];
  loginid = [];
  res.redirect("/")
});

app.get("/", (req, res) => {
    res.render("login.ejs")
});

app.post("/postreminder", async (req, res) => {

        let subjecttitle = req.body.subject;
        let reminderdatetitle = req.body.remindertime.split('T')[0];
        let remindertimetitle = req.body.remindertime.split('T')[1];

  try {
    const result = await db.query("INSERT INTO reminder (subject, remindertime, login_id, reminderdate) VALUES ($1, $2, $3, $4)",
        [subjecttitle, remindertimetitle, loginid[0], reminderdatetitle,
    ]);
    console.log(result);
    posts = [];
    count = 0;
    res.redirect("/homepage");
    
  } catch (err) {
    console.log(err);
  }
    
});


app.post("/register", async (req, res) => {

  const fullname = req.body.fullname;
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM login WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      const result = await db.query(
        "INSERT INTO login (full_name, email, password) VALUES ($1, $2, $3)",
        [fullname, email, password]
      );
      res.redirect("/homepage");
    }
  } catch (err) {
    console.log(err);
  }

  
});

app.post("/login", async (req, res) => {

  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM login WHERE email = $1", [
      email,
    ]);
    console.log(email);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      loginemail.push(email);

      const storedid = user.id;
      loginid.push(storedid);

      if (password === storedPassword) {
        res.redirect("/homepage");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }

});



app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
})
