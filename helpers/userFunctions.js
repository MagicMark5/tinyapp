const generateRandomString = (length) => {
  let randomString = "";
  const alphaNums = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * alphaNums.length);
    randomString += alphaNums[randomIndex];
  }
  return randomString;
};

const createUser = (userBody, userDB) => {
  const { username, name, icon, email, password } = userBody; // userBody will be req.body when passed in
  // only create newID if validateUser returns user: null, error: email
  const newID = generateRandomString(6);
  // update the userDatabase
  userDB[newID] = userBody;

  return newID;
};

const findUser = (userID, userDB) => {
  const currentUser = userDB[userID];
  
  return currentUser;
};  


module.exports = { generateRandomString, createUser, findUser };