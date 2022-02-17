"use strict";

const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs"); // import for hashing passwords

/**
 *
 * EXPORTS: User Model
 * firstName, lastName, emailAddress, password, confirmedPassword userId(one-to-many associations)
 */
module.exports = (sequelize) => {
  class User extends Model {}
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A first name is required",
          },
          notEmpty: {
            msg: "A first name is required",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A last name is required",
          },
          notEmpty: {
            msg: "A last name is required",
          },
        },
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "The email you entered already exists",
        },
        validate: {
          notNull: {
            msg: "An email is required",
          },
          isEmail: {
            msg: "A valid email is required",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A password is required",
          },
          notEmpty: {
            msg: "A password is required",
          },
          len: {
            args: [8, 20],
            msg: "Password must be between 8 and 20 characters",
          },
        },
      },
      // confirmedPassword: {
      //   type: DataTypes.VIRTUAL,
      //   allowNull: false,
      //   validate: {
      //     notNull: {
      //       msg: "A password confirmation is required",
      //     },
      //     notEmpty: {
      //       msg: "A password confirmation is required",
      //     },
      //     len: {
      //       ags: [8, 20],
      //       msg: "Password must be between 8 and 20 characters",
      //     },
      //   },
      // },
      //   password: {
      //     type: DataTypes.STRING,
      //     allowNull: false,
      //     set(val) {
      //       if (val === this.confirmedPassword) {
      //         const hashedPassword = bcrypt.hashSync(val, 10);
      //         this.setDataValue("password", hashedPassword);
      //       } else {
      //         throw new Error("Password and confirmed password must match");
      //       }
      //     },
      //     validate: {
      //       notNull: {
      //         msg: "Passwords must match",
      //       },
      //       notEmpty: {
      //         msg: "A password is required",
      //       },
      //     },
      //   },
    },
    { sequelize }
  );

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "courses",
      foreignKey: {
        fieldName: "userId",
      },
    });
  };
  return User;
};
