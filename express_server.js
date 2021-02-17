const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// Set view engine to ejs 
app.set('view engine', 'ejs');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(length) {
  let randomString = "";
  const alphaNums = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * alphaNums.length);
    randomString += alphaNums[randomIndex];
  }
  return randomString;
};

// POST request handling

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = `${req.body.longURL}`;
  res.redirect(`/urls/${newShortURL}`);   // Respond with redirect (302) to new short URL -302 means URI of requested resource has changed temporarily
});

app.post("/login", (req, res) => {
  // set cookie - key=username & value=req.body.username (the input form from _header.ejs)
  res.cookie("username", req.body.username);
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  // clear username cookie
  res.clearCookie("username");
  res.redirect("/urls/");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const newLongURL = `${req.body.longURLEdit}`;
  // console.log(req.params.shortURL);
  // console.log("New longURL: " + newLongURL);
  if (Object.values(urlDatabase).includes(newLongURL)) {
    console.log("You already have a short URL for this website URL");
  } else {
    urlDatabase[req.params.shortURL] = newLongURL;
  }
  res.redirect("/urls");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls'); // this is another get request
});


//GET Request Hanlding

app.get('/', (req, res) => {
  res.redirect('/urls'); // express allows us to just pass in an object and it will automatically JSON.stringify for us
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // express allows us to just pass in an object and it will automatically JSON.stringify for us
});

app.get('/urls', (req, res) => {
  // 'urls' will be our variable to for urlDatabase in our template file urls_index.ejs
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render('urls_register', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
   };
  res.render("urls_new", templateVars);
}); // must be above /urls/:id...routes should be ordered from most to least specific...

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  // save template variables based on url requested (req.params)
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
    };
  
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).render("404.ejs", templateVars);
  }
  
});

// Catch any other request not caught by the above
app.get("*", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.status(404).render("404.ejs", templateVars);
});  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});