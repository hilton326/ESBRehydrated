import { User } from '../models/User';
import { RegistrationForm } from '../dto/users/RegistrationForm';

// Used to encrypt passwords
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary user array (until we use a database)
let userList: User[] = []


/* List of things to do here:
* Make sure email is an email
* Make sure username does not contain @
* Security reqs for password */

// Make sure the username doesn't already exist in the database
function checkIfUsernameExists(newUsername: string) {
    try {
        // Check database for user matching the username: later should call userRepository or whatever
        const user = userList.find(user => user.username === newUsername);

        // Return true if username found; if not, return null
        // Also return status and error message if applicable
        const response = user 
            ? {exists: true, code: 403, error: "Sorry, that username already exists."} 
            : {exists: false, code: 200, error: null};
        return response;

    } catch (serverError) {
        return {exists: null, code: 500, error: "Unexpected server error: " + serverError};
    }
}

// Ensure password meets security requirements
function checkPassword(password: string) {
    // WIP: requirements not yet decided
}

// Encrypt password using Bcrypt
async function hashPassword(password: string) {
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        return {password: hashedPassword, code: 200, error: null};
    } catch (serverError) {
        return {password: null, code: 500, error: "Error encrypting the password: " + serverError};
    }
}

// Store the new user in the database
function createNewUser(email: string, username: string, hashedPassword: string) {
    try {
        // Create user
        const newUser: User = {
            id: userList.length + 1,
            email: email,
            username: username,
            password: hashedPassword,
            status: "unverified"
        }
        userList.push(newUser);

        // Response body
        return {username: newUser.username, id: newUser.id, message: "New user created successfully!"};

    } catch (serverError) {
        // If there is an error creating a user in the database
        return {username: username, id: -1, message: "Error creating new user: " + serverError};
    }
}

export { checkIfUsernameExists, checkPassword, hashPassword, createNewUser, userList };