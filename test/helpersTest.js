const { assert } = require('chai');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const { 
  getUserByEmail, 
  httpAppend, 
  generateRandomString,
  validateUser
} = require('../helpers/userFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// getUserByEmail
describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined with a non-existant email', function() {
    const user = getUserByEmail("user123@example.com", testUsers);
    const expectedOutput = undefined;
    
    assert.strictEqual(user, expectedOutput);
  });

});

// httpAppend
describe('httpAppend', function() {

  it('should return a url with http:// appended to beginning of string when not provided', function() {
    const url = httpAppend("www.example.com");
    const expectedOutput = "http://www.example.com";
    
    assert.strictEqual(url, expectedOutput);
  });

  it('should return a url with http:// appended only once when it is provided', function() {
    const url = httpAppend("http://www.example.com");
    const expectedOutput = "http://www.example.com";
    
    assert.strictEqual(url, expectedOutput);
  });

  it('should return a url with https:// appended when it is provided', function() {
    const url = httpAppend("https://www.mozilla.org/en-US/");
    const expectedOutput = "https://www.mozilla.org/en-US/";
    
    assert.strictEqual(url, expectedOutput);
  });

});

// generateRandomString
describe('generateRandomString', function() {

  it('should return a unique random string every given number of function calls', function() {
    const shortURLsTest1 = [];
    const shortURLsTest2 = [];
    let foundMatch = false;

    let tests = 0; 
    // generate 100 unique strings and push 50 of them to test array 1, and other 50 to test array 2
    while (tests < 10) {
      let string = generateRandomString(6);
      if (tests % 2 !== 0) {
        shortURLsTest1.push(string);
      } else {
        shortURLsTest2.push(string);
      }
      tests++;
    };

    // Nested Loop through both test arrays and compare each string, looking for match
    for (let str1 of shortURLsTest1) {
      for (let str2 of shortURLsTest2) {
        foundMatch = str1 === str2 ? true : false;
      }
    }
    
    assert.equal(foundMatch, false);
  });

  it('should return a randomized string of given number of characters in length via number argument', function() {
    
    const randomURL = generateRandomString(10);
    const expectedOutput = 10;
    
    assert.equal(randomURL.length, expectedOutput);
  });

});

// validateUser
describe('validateUser', function() {

  it('should return a user object and no error when logging in with valid email/password', function() {
    const { user, error } = validateUser("user@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = { user: testUsers["userRandomID"], error: null };
    
    assert.deepEqual({ user, error }, expectedOutput);
  });

  it('should return a null user and "password" error when logging in with valid email and and incorrect password', function() {
    const { user, error } = validateUser("user@example.com", "pink-zebra-dishwasher", testUsers);
    const expectedOutput = { user: null, error: "password" };
    
    assert.deepEqual({ user, error }, expectedOutput);
  });

  it('should return a null user and "email" error when logging in with invalid email (email not in database)', function() {
    const { user, error } = validateUser("user3@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = { user: null, error: "email" };
    
    assert.deepEqual({ user, error }, expectedOutput);
  });

});