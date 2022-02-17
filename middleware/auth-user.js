"use strict";

const auth = require("basic-auth"); // imports basic-auth to get authorization header
const bcrypt = require("bcryptjs"); // imports bcrypt to hash passwords
const { User } = require("../models"); // imports User Model
const { Course } = require("../models");
/**
 * EXPORTS: authenticateUser()
 * - This middleware authenticates user passed in authorization header against database Users.
 * - If user is authenticated next() is called.
 * - Returns error if authorization username(emailAddress) and password doesn't match database users.
 */
exports.authenticateUser = async (req, res, next) => {
  let errorMessage;

  // parse user's credentials from the authorization header.
  const credentials = auth(req);

  if (credentials) {
    // checks database for username(email address) that matches
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name,
      },
      include: {
        model: Course,
        as: "courses",
      },
    });
    if (user) {
      // if user matches username(email address) then hashed passwords are checked
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        // publicUser excludes password, createdAt, updatedAt from User Model
        const publicUser = await User.findOne({
          where: {
            emailAddress: user.emailAddress,
          },
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          include: {
            model: Course,
            as: "courses",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        });
        // user is authenticated
        console.log(
          `Authentication successful for username: ${publicUser.emailAddress}`
        );

        req.currentUser = publicUser; // saves user info to req.currentUser passed to next() middleware
      } else {
        // user found but password is incorrect
        errorMessage = `Authentication failed for username: ${credentials.name}`;
      }
    } else {
      // no user found matching username(emailaddress)
      errorMessage = `The Username "${credentials.name}" was NOT found`;
    }
  } else {
    // no credentials from authorization header
    errorMessage = `Authentication header not found`;
  }
  if (errorMessage) {
    // error found deny access
    console.warn(errorMessage);
    res.status(401).json({ message: "Access Denied" });
  } else {
    next(); // authentication succeeded call next()
  }
};
