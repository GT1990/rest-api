"use strict";

const express = require("express"); // imports express
const User = require("../models").User; // imports User Model
const { asyncHandler } = require("../middleware/async-handler"); // wraps middleware in try/catch
const { authenticateUser } = require("../middleware/auth-user"); // import middleware that authenticates users
const router = express.Router(); // creates router instance

/**
 * GET: /api/users
 * Returns all properties and values for the currently authenticated User along with a 200 Ok HTTP status code.
 */
router.get(
  "/",
  authenticateUser, // authenticates user before moving forward
  asyncHandler(async (req, res) => {
    const user = req.currentUser; // user passed by authenticateUser middleware
    res.status(200).json({ user }); // 200 Ok
  })
);

/**
 * POST: /api/users
 * Creates a new user, sets the Location header to "/", and return a 201 Created HTTP status code and no content.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    let user;
    try {
      user = await User.create(req.body); // creates new user and saves to database
      res.location("/").status(201).end(); // 201 Created
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        // sequelize errors found
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors }); // 400 Bad Request
      } else {
        // pass error to global error handler
        throw error;
      }
    }
  })
);

module.exports = router;
