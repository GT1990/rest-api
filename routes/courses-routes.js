"use strict";

const express = require("express"); // imports express
const { asyncHandler } = require("../middleware/async-handler"); // wraps middleware in try/catch
const { authenticateUser } = require("../middleware/auth-user"); // import middleware that authenticates users
const User = require("../models/").User; // imports User Model
const Course = require("../models/").Course; // imports Course Model
const router = express.Router(); // creates router instance
/**
 * GET: /api/courses
 * Returns all courses including the User associated with each course and a 200 Ok HTTP status code.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // retrieves all courses from database
    const courses = await Course.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
      ],
    });
    if (courses) {
      res.status(200).json({ courses }); // 200 Ok
    } else {
      // no courses found
      res.status(404).json({ message: "No courses found" });
    }
  })
);

/**
 * GET: /api/courses/:id
 * Returns the corresponding course, User associated with that course and a 200 Ok HTTP status code.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
      ],
    });
    if (course) {
      res.status(200).json({ course }); // 200 Ok
    } else {
      // course not found
      res.status(404).json({ message: "Course not found" }); // 404 Not Found
    }
  })
);

/**
 * POST: /api/courses
 * Creates a new course, set the Location header to the URI for the newly created course, and returns a 201 HTTP status code with no content.
 */
router.post(
  "/",
  authenticateUser, // authenticates user before moving forward
  asyncHandler(async (req, res) => {
    let course;
    try {
      const user = req.currentUser; // user passed by authenticateUser middleware
      course = await Course.create({ userId: user.id, ...req.body }); // creates new course
      res.location("/").status(201); // 201 Created
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

/**
 * PUT: /api/courses/:id
 * Updates the corresponding course and returns a 204 no content HTTP status code.
 */
router.put(
  "/:id",
  authenticateUser, // authenticates user before moving forward
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id); // retrieves course based on param id
      if (course) {
        if (course.userId == req.currentUser.id) {
          // (req.currentUser) user passed by authenticateUser middleware
          // only allows user that created the course to make updates
          await course.update(req.body); // updates course
          await course.save(); // saves course update
          res.status(204).send(); // 204 No Content
        } else {
          // user does not match course userId
          res.status(403).json({
            // 403 Forbidden
            message:
              "Access denied: only the user that created this course can make changes to this course",
          });
        }
      } else {
        // no course found
        res
          .status(404) // 404 Not Found
          .json({
            message: `Course with id of ${req.params.id} was NOT found`,
          });
      }
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

/**
 * DELETE: /api/courses/:id
 * DeleteS the corresponding course and returnS a 204 no content HTTP status code.
 */
router.delete(
  "/:id",
  authenticateUser, // authenticates user before moving forward
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      if (course.userId == req.currentUser.id) {
        // (req.currentUser) user passed in by authenticateUser middleware
        // only allows user that created the course to delete it
        await course.destroy(); // deletes course
        res.status(204).send(); // 204 No Content
      } else {
        // user not matched access denied
        res.status(403).json({ message: "Access denied" }); // 403 Forbidden
      }
    } else {
      // no course found matching id
      res.status(404).json({ message: "Course was not found" }); // 404 Not Found
    }
  })
);

// exports router
module.exports = router;
