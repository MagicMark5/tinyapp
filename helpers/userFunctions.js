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
  const { username, name, icon, email, password } = userBody; // userBody will be req.body when passed in
  const { user, error } = validateUser(email, password, userDB);

  // only create newID if validateUser returns { user: null, error: "email" }
  if (error === "email") {
    const newID = generateRandomString(6);
    // update the userDatabase
    userDB[newID] = userBody;
    return newID;
  } else {
    return error;
  }
  
};

const findUser = (userID, userDB) => {
  const currentUser = userDB[userID];
  
  return currentUser;
};  


module.exports = { generateRandomString, createUser, findUser, emailExists };