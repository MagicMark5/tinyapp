const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const { 
  generateRandomString, 
  createUser, 
  findUser, 
  emailExists, 
  validateUser 
} = require('./helpers/userFunctions');

// Set view engine to ejs 
app.set('view engine', 'ejs');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur", 
    icon: "🐶"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk",
    icon: "🐹"
  }
};

// POST request handling

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = `${req.body.longURL}`;
  res.redirect(`/urls/${newShortURL}`);   // Respond with redirect (302) to new short URL -302 means URI of requested resource has changed temporarily
});

app.post("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: findUser(req.cookies["user_id"], userDatabase)
  };

  // If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).render("400.ejs", templateVars); 
    return;
  } 

  // If someone tries to register with an email that is already in the users object, send back a response with the 400 status code. 
  if (emailExists(req.body.email, userDatabase)) {
    res.status(400).render("400.ejs", templateVars); 
    return;
  }

  // add a new user object to the global userDatabase
  const newUserID = createUser(req.body, userDatabase);  // this value will be error if incorrect

  // set a user_id cookie containing the user's newly generated ID.
  if (Object.keys(userDatabase).includes(newUserID)) {
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  } else {
    console.log(`The id ${newUserID} is not in the userDatabase`);
    res.send(`The id ${newUserID} is not in the userDatabase`);
  }

});

app.post("/login", (req, res) => {
  
  const templateVars = { 
    urls: urlDatabase,
    user: findUser(req.cookies["user_id"], userDatabase)
  };

  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!emailExists(req.body.email, userDatabase)) {
    res.status(403).render("403.ejs", templateVars); 
    return;
  } else {
    // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. 
    const { user, error } = validateUser(req.body.email, req.body.password, userDatabase);
    // If it does not match, return a response with a 403 status code.
    if (error === "password") {
      res.status(403).render("403.ejs", templateVars); 
      return;
    } else {
      // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
      res.cookie("user_id", user.id);
      res.redirect("/urls/");
    }
  }
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
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
    user: findUser(req.cookies["user_id"], userDatabase)
  };
  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: findUser(req.cookies["user_id"], userDatabase)
  };
  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: findUser(req.cookies["user_id"], userDatabase)
  };
  res.render('urls_register', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: findUser(req.cookies["user_id"], userDatabase)
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
    user: findUser(req.cookies["user_id"], userDatabase)
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
    user: findUser(req.cookies["user_id"], userDatabase)
  };
  res.status(404).render("404.ejs", templateVars);
});  


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});