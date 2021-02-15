const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Set view engine to ejs 
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase); // express allows us to just pass in an object and it will automatically JSON.stringify for us
});

app.get('/urls', (req, res) => {
  // 'urls' will be our variable to for urlDatabase in our template file urls_index.ejs
  const templateVars = { urls: urlDatabase }; 
  res.render('urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); // curl -i http://localhost:8080/hello shows the entire HTTP response string (headers, html content)



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});