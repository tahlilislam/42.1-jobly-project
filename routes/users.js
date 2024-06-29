"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdminUser, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login as admin
 **/

router.post("/", ensureLoggedIn, ensureAdminUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login as admin
 **/

router.get("/",ensureLoggedIn ,ensureAdminUser, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login as admin or the specific user who owns the account
 **/

router.get("/:username",ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const jobs = await User.getApplications(req.params.username);
    user.jobs = jobs;
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login as admin or specific user who owns the account
 **/

router.patch("/:username",ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login or specific user who owns the account
 **/

router.delete("/:username",ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

router.post("/:username/jobs/:id", ensureLoggedIn, ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.applyToJob(req.params.username, req.params.id);
    return res.status(201).json({ applied: req.params.id });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;

// tlily
// {
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRsaWx5IiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTcxOTI3NDc3NX0.3o6wUe_wU-6crIoqjlJ_pwqrhkNZMka3Xi385lhCp58"
// }

// admin
// {
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTcxOTI3NTkzNX0._s6juwKc2mbBuTHTJrWnKT2vEO3AGOedJ-oJU3ZNk1U"
// }

// // {
// 	"user": {
// 		"username": "tahz",
// 		"firstName": "Tahz",
// 		"lastName": "Iss",
// 		"email": "tahz@gmail.com",
// 		"isAdmin": true
// 	},
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRhaHoiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3MTk1OTU0Mzd9.CYWEGjWec_5Y9WX2bqATG-m_xOFpfIuat2O3C6HwXxs"
// }