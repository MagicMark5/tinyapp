const generateRandomString = (length) => {
  let randomString = "";
  const alphaNums = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * alphaNums.length);
    randomString += alphaNums[randomIndex];
  }
  return randomString;
};

const emailExists = (email, userDB) => {
  console.log(userDB);
  return (Object.values(userDB).find(userObj => userObj.email === email)) ? true : false;
};

const validateUser = (email, password, userDB) => {

  const currentUser = Object.values(userDB).find(userObj => userObj.email === email);
  
  if (currentUser) {
    if (currentUser.password === password) {
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

}

const createUser = (userBody, userDB) => {
  const { email, password, icon } = userBody; // userBody will be req.body when passed in
  
  const newID = generateRandomString(6);
  
  // Assign newID to new user object as we update the database with form data
  userDB[newID] = { id: newID, email, password, icon };

  // return newID so cookie can be set
  return newID; 
};

const findUser = (userID, userDB) => {
  const currentUser = userDB[userID];
  
  return currentUser;
};  


module.exports = { generateRandomString, createUser, findUser, emailExists, validateUser };