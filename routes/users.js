var express = require('express');
var router = express.Router();
const User = require("../data/User")
const jwt = require("jsonwebtoken")

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post("/register", (req, res) => {
  try {
    if (req.body.email &&
      req.body.username &&
      req.body.password) {
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      }
      User.create(userData, function (err, user) {
        if (err) {
          res.status(500).json({
            error: err.message
          })
        } else {
          res.json({
            redirect: "index"
          })
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "error"
    })
  }
})

router.post("/login", (req, res) => {

  try {
    if (req.body.email &&
      req.body.password) {
      User.authenticate(req.body.email, req.body.password, (err, user) => {
        if (err)
          res.status(err.status).json({
            error: err.message
          })
        else if (user) {
          var token = jwt.sign({
            username: user.username,
            email: user.email
          }, process.env.JWT_SECRET);
          res.json({
            id: user._id,
            username: user.username,
            token: token,
            message: "Login success"
          })
        }
      })
    }
  } catch (error) {
    res.status(500).json({
      error: "error"
    })
  }

})

router.get('/logout', function (req, res, next) {
  res.json({
    message: "Logout success"
  })
});

module.exports = router;