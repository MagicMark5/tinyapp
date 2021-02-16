const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Set view engine to ejs 
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  urlDatabase[newShortURL] = `http://${req.body.longURL}`;
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);   // Respond with redirect (302) to new short URL -302 means URI of requested resource has changed temporarily
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const newLongURL = `http://${req.body.longURLEdit}`;
  console.log(req.params.shortURL);
  console.log("New longURL: " + newLongURL);
  urlDatabase[req.params.shortURL] = newLongURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls'); // this is another get request
});


//GET Request Hanlding

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // express allows us to just pass in an object and it will automatically JSON.stringify for us
});

app.get('/urls', (req, res) => {
  // 'urls' will be our variable to for urlDatabase in our template file urls_index.ejs
  const templateVars = { urls: urlDatabase }; 
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
}); // must be above /urls/:id...routes should be ordered from most to least specific...

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  // save template variables based on url requested (req.params)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).render("404.ejs", templateVars);
  }
  
});

// Catch any other request not caught by the above
app.get("*", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.status(404).render("404.ejs", templateVars);
});  // curl -i http://localhost:8080/hello shows the entire HTTP response string (headers, html content)



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});