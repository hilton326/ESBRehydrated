import { User } from '../models/User';
import { RegistrationConfirmation } from '../dto/users/RegistrationConfirmation';

// Used to encrypt passwords
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary user array (until we use a database)
let userList: User[] = []

// Make sure the username is not taken
function checkIfUsernameExists(newUsername: string) {
    // "Find" function is basically the same as a loop through the array
    const existingUser = userList.find(user => user.username === newUsername)
    if (existingUser) {
        return true;
    } 
    return false;
}

// Ensure password meets security requirements
function checkPassword(password: string) {
    // WIP: requirements not yet decided
}

// Encrypt password
async function hashPassword(password: string) {
    const hashedPassword = await bcrypt.hash(password, 8);
    return hashedPassword;
}

// Store the new user in the database
function createUser(username: string, password: string) {
    // Create user
    const newUser: User = {
        id: userList.length + 1,
        username: username,
        password: password
    }
    userList.push(newUser);

    // Create response body (registration confirmation)
    const response: RegistrationConfirmation = {
        username: newUser.username,
        id: newUser.id,
        message: "New user created successfully!"
    }
    return response;
}

export { checkIfUsernameExists, checkPassword, hashPassword, createUser, userList }



