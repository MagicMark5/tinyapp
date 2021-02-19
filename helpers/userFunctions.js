const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateRandomString = (length) => {
  let randomString = "";
  const alphaNums = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * alphaNums.length);
    randomString += alphaNums[randomIndex];
  }
  return randomString;
};

const httpAppend = (url) => {
  if (url.includes("http://") || url.includes("https://") ) {
    return url;
  } else {
    return `http://${url}`;
  }
};

const getUserByEmail = (email, userDB) => {
  const user = Object.values(userDB).find(userObj => userObj.email === email);
  return user;
};

const validateUser = (email, password, userDB) => {
  const currentUser = getUserByEmail(email, userDB);
  
  if (currentUser) {
    if (bcrypt.compareSync(password, currentUser.password)) {
      // login success
      return { user: currentUser, error: null }
    } else {
      // incorrect password 
      return { user: null, error: "password" }
    }
  } else {
    // currentUser email could not be found in database (undefined)
    return { user: null, error: "email" }
  }

};

const createUser = (userBody, userDB) => {
  const { email, password, icon } = userBody; // userBody will be req.body when passed in
  
  const newID = generateRandomString(6);
  
  // Assign newID to new user object as we update the database with form data
  userDB[newID] = { 
    id: newID, 
    email, 
    password: bcrypt.hashSync(password, saltRounds), 
    icon 
  };

  // return newID so cookie can be set
  return newID; 
};

const urlsForUser = (id, urlDB) => {
  // returns the URLs where the userID is equal to the id of the currently logged-in user.
  const urlsForUser = {};
  
  for (const url in urlDB) {
    if (id === urlDB[url].userID) {
      urlsForUser[url] = { 
        longURL: urlDB[url].longURL, 
        date: urlDB[url].dateCreated,
        hits: urlDB[url].hits,
        uniqueHits: urlDB[url].uniqueHits
      };
    }
  }
  
  return urlsForUser;
};

const getTodaysDate = () => {
  const ms = new Date();
  const dd = String(ms.getDate()).padStart(2, '0');
  const mm = String(ms.getMonth() + 1).padStart(2, '0');
  const yyyy = ms.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};


module.exports = { generateRandomString, createUser, getUserByEmail, validateUser, httpAppend, urlsForUser, getTodaysDate };