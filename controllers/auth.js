const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SEND_GRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length <= 0) {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    error: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      } else {
        const hashedPassword = user.password;
        return bcrypt.compare(password, hashedPassword).then((resPassword) => {
          if (!resPassword) {
            return res.redirect("/login");
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          res.redirect("/");
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //const checkPassword = req.body.checkPassword;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const new_user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return new_user.save();
        })
        .then((user) => {
          req.session.isLoggedIn = true;
          req.session.user = user;
          res.redirect("/");
          return transporter
            .sendMail({
              to: email,
              from: process.env.MY_EMAIL,
              subject: "Signup succeeded!",
              html: "<h1>You sucessfully signed up!</h1>",
            })
            .catch((err) => {
              console.log(err);
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
