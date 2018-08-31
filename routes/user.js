var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');


router.post('/register', function(req, res) {
    User.register(new User({ firstname: req.body.firstname, lastname: req.body.lastname, organization: req.body.organization, securityQuestion: req.body.securityQuestion, securityAnswer: req.body.securityAnswer, username: req.body.email }), req.body.password, function(err, account) {
        if (err) {
            return res.status(500).json({
                err: err
            });
        }
        passport.authenticate('local')(req, res, function() {
            return res.status(200).json({
                status: 'Registration successful!'
            });
        });
    });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});



router.post('/changePassword', function(req, res) {

    if (!req.isAuthenticated()) {
        return res.status(500).json({
            err: "Access denied. User not logged in"
        });
    } else {
        User.findByUsername(req.body.username).then(function(sanitizedUser) {
            if (sanitizedUser) {
                sanitizedUser.changePassword(req.body.oldPassword, req.body.newPassword, function(err) {
                    if (err) {
                        return res.status(500).json({
                            err: 'Incorrect Old Password'
                        });
                    } else {
                        sanitizedUser.save();
                        res.status(200).json({ message: 'Password Reset Successful' });
                    }

                });
            } else {
                res.status(500).json({ err: 'This user does not exist' });
            }
        }, function(err) {
            res.status(500).json({ err: 'This user does not exist' });
        });
    }
});

router.post('/forgotPassword', function(req, res) {

    User.findOne({username: req.body.username, securityQuestion: req.body.securityQuestion, securityAnswer: req.body.securityAnswer }).then(function(sanitizedUser) {
            if (sanitizedUser) {
                res.status(200).json({ message: sanitizedUser.securityQuestion });
            } else {
                res.status(500).json({ err: 'Invalid details' });
            }
        }, function(err) {
            res.status(500).json({ err: 'This user does not exist' });
        });
});

router.post('/setPassword', function(req, res) {

    User.findOne({username: req.body.username}).then(function(sanitizedUser) {
            if (sanitizedUser) {
                sanitizedUser.setPassword(req.body.password, function(err) {
                    if (err) {
                        return res.status(500).json({
                            err: 'Error changing password'
                        });
                    } else {
                        sanitizedUser.save();
                        res.status(200).json({ message: 'Password Reset Successful' });
                    }

                });
            } else {
                res.status(500).json({ err: 'This user does not exist' });
            }
        }, function(err) {
            res.status(500).json({ err: 'This user does not exist' });
        });
});

router.post('/changeName', function(req, res) {

    if (!req.isAuthenticated()) {
        return res.status(500).json({
            err: "Access denied. User not logged in"
        });
    } else {
        User.findByUsername(req.body.username).then(function(sanitizedUser) {
            if (sanitizedUser) {
                sanitizedUser.firstname = req.body.firstname;
                sanitizedUser.lastname = req.body.lastname;

                sanitizedUser.save(function(err, data) {
                    if (err)
                        return res.status(500).json({
                            err: 'Error updating name'
                        });
                    else {
                        res.status(200).json({ message: 'Name Reset Successful' });
                    }
                });
            } else {
                res.status(500).json({ err: 'This user does not exist' });
            }
        }, function(err) {
            res.status(500).json({ err: 'This user does not exist' });
        });
    }
});



router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/status', function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            user: null
        });
    }
    res.status(200).json({
        user: req.user
    });
});

router.get('/userDetails', function(req, res) {
    res.send(req.user);
});


module.exports = router;