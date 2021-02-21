const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const methodOverride = require('method-override')
const app = express();
const PORT = 8080; 
const { 
  generateRandomString, 
  httpAppend,
  createUser, 
  getUserByEmail,
  validateUser, 
  urlsForUser,
  getTodaysDate
} = require('./helpers/userFunctions');

// Setting ejs as the template engine
app.set('view engine', 'ejs');

// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// for encrypting cookies
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4d9c-acd7-eebdccb368d5', 'f13b4d38-41c4-46d3-9ef6-8836d03cd8eb'],
}))

const urlDatabase = {};
const userDatabase = {};

// ROUTES (GET/POST handling)

app.get('/', (req, res) => {
  if (userDatabase[req.session["user_id"]]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get('/prompt', (req, res) => {
  // renders prompt view to login/register if attempting to access /urls or /urls/new
  const templateVars = { 
    user: userDatabase[req.session["user_id"]]
   };
  res.render('prompt', templateVars);
});

/*  /urls */

app.get('/urls', (req, res) => {
  const templateVars = { 
    // urls will be a user specific object of all of their { shortURL: { longURL, hits, uniqueHits } }
    urls: urlsForUser(req.session["user_id"], urlDatabase), 
    user: userDatabase[req.session["user_id"]]
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session["user_id"]], 
    alreadyExists: false 
  };
  const newLongURL = `${httpAppend(req.body.longURL)}`;
  const longURLArray = Object.values(urlsForUser(req.session["user_id"], urlDatabase));
  
  if (longURLArray.includes(newLongURL)) { 
    // url already exists in the users /urls
    templateVars.alreadyExists = true;
    res.render("urls_new", templateVars);
  } else {
    // successful post to add new URL
    let newShortURL = generateRandomString(6);
    urlDatabase[newShortURL] = { 
      longURL: `${httpAppend(req.body.longURL)}`, 
      userID: req.session["user_id"],
      dateCreated: getTodaysDate(),
      hits: 0,
      uniqueHits: []
    };
    res.redirect(`/urls/${newShortURL}`);  
  }
  
});

/*  /register  */

app.get('/register', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: userDatabase[req.session["user_id"]]
  };

  // if logged in, redirect to /urls
  if (userDatabase[req.session["user_id"]]) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
  
});

app.post("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: userDatabase[req.session["user_id"]], 
    error: "The provided email and/or password do not match our records."
  };

  // If post request is made with cURL or the e-mail or password are empty strings, send back a response with the 400 status code.
  if (Object.keys(req.body).length === 0 || req.body.email === "" || req.body.password === "") {
    templateVars.error = "The email address or password input fields were empty.";
    res.status(400).render("400.ejs", templateVars); 
    return;
  } 

  // If registering an email that is already in the userDatabase, send back a response with the 400 status code.
  if (getUserByEmail(req.body.email, userDatabase)) {
    templateVars.error = "The provided email address already exists in our records!";
    res.status(400).render("400.ejs", templateVars); 
    return;
  }

  // add a new user object with new ID to the global userDatabase
  const newUserID = createUser(req.body, userDatabase);

  // set a user_id cookie containing the user's newly generated ID.
  req.session['user_id'] = newUserID;
  res.redirect("/urls");
});

/*  /login  */

app.get('/login', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: userDatabase[req.session["user_id"]]
  };

  // if logged in, redirect to /urls
  if (userDatabase[req.session["user_id"]]) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }

});

app.post('/login', (req, res) => {
  
  const templateVars = { 
    urls: urlDatabase,
    user: userDatabase[req.session["user_id"]],
    error: "An invalid password or email address was provided."
  };

  // If user is already logged in, redirect and return
  if (userDatabase[req.session["user_id"]]) {
    res.redirect('/urls');
    return;
  }

  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!getUserByEmail(req.body.email, userDatabase)) {
    templateVars.error = "We do not have the provided email address in our records. \n Click 'Register' in the top right corner to make an account!";
    res.status(403).render("403.ejs", templateVars); 
    return;
  } else {
    // If a user with that e-mail address is located, compare the password given in the form with the existing user's password. 
    const { user, error } = validateUser(req.body.email, req.body.password, userDatabase);
    // If it does not match, return a response with a 403 status code.
    if (error === "password") {
      templateVars.error = "Your password is incorrect!";
      res.status(403).render("403.ejs", templateVars); 
      return;
    } else {
      // If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
      req.session["user_id"] = user.id;
      res.redirect("/urls/");
    }
  }
  
});

/*  /logout  */

app.post("/logout", (req, res) => {
  delete req.session["user_id"];
  res.redirect("/urls");
});

/*   /edit and /delete  */

app.put('/urls/:shortURL/edit', (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlObject.longURL,
    user: userDatabase[req.session["user_id"]],
    alreadyExists: false
  };
  // first check if current user id in cookie matches that of the requested shortURL
  if (req.session["user_id"] === urlObject.userID) {
    const newLongURL = `${httpAppend(req.body.longURLEdit)}`;
    const longURLArray = Object.values(urlsForUser(req.session["user_id"], urlDatabase));
    // then check if requested long url already exists in their list of urls
    if (longURLArray.includes(newLongURL)) { 
      templateVars.alreadyExists = true;
      res.render("urls_show", templateVars);
    } else {
      // successful edit and values are updated or reset
      urlObject.longURL = newLongURL;
      urlObject.hits = 0;
      urlObject.dateCreated = getTodaysDate();
      urlObject.uniqueHits = [];
      res.redirect("/urls");
    }
  } else {
    res.redirect('/urls');
  }
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  if (req.session["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls'); // this is another get request
});

/*   /urls/new  /u/:shortURL  /urls/:shortURL   */

// must be before /urls/:id...
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: userDatabase[req.session["user_id"]], 
    alreadyExists: false
   };
  
  if (userDatabase[req.session["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
}); 

app.get("/u/:shortURL", (req, res) => {
  // store requested destination
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  // incremet hit counters 
  // (only push to unique hits if request is coming from unique IP address)
  if (!urlDatabase[shortURL].uniqueHits.includes(req.socket.remoteAddress)) {
    urlDatabase[shortURL].uniqueHits.push(req.socket.remoteAddress);
  }
  urlDatabase[shortURL].hits++;

  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlObject.longURL,
    user: userDatabase[req.session["user_id"]], 
    alreadyExists: false
  };
  
  if (urlObject && urlObject.userID === req.session["user_id"]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).render("404.ejs", templateVars);
  }
  
});

// Catch any other request not caught by the above
app.get("*", (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlObject,
    user: userDatabase[req.session["user_id"]]
  };
  res.status(404).render("404.ejs", templateVars);
});  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});