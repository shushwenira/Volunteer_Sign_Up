var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Events = require('../models/events.js');

var json2csv = require('json2csv');

var transporter = require('nodemailer').createTransport({
    service: 'gmail',
    auth: {
        user: 'donotreply.volunteersignup@gmail.com',
        pass: Buffer.from('Vm9sdW50MzNy', 'base64').toString()
    }
});

router.post('/sendEmail', function(req, res) {
    transporter.sendMail({
        from: 'Volunteer Signup <donotreply.volunteersignup@gmail.com>',
        to: req.body.to,
        bcc: req.body.bcc,
        subject: req.body.subject,
        html: req.body.message,
    }, function(err, info) {
        if (err)
            res.send(err);
        else {
            res.json(info);
        }
    });
});

router.post('/downloadCSV', function(req, res) {
    var csv = json2csv.parse(req.body.payload, { fields: ['Task', 'When', 'Volunteer', 'Email', 'Phone'] });
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader("Content-Disposition", 'attachment; filename=signups.csv;');
    res.end(csv, 'binary');
});


router.post('/allEvents', function(req, res) {
    Events.find({
        owner: req.body.username
    }, function(err, events) {
        if (err)
            res.send(err);
        else {
            events.sort(function(x, y) { return x.isDeactivated - y.isDeactivated });
            res.json(events);
        }

    });
});


router.post('/createEvent', function(req, res) {
    Events.create(req.body.event, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }

    });
});

router.post('/secureEventDetails', function(req, res) {
    var id = { _id: req.body._id };
    id._id = mongoose.mongo.ObjectId(id._id);
    Events.find(id, function(err, data) {
        if (err)
            res.send(err);
        else {
            if (data[0]) {
                for (var i = 0; i < data[0].what.length; i++) {
                    var task = data[0].what[i];
                    for (var j = 0; j < task.people_signedup.length; j++) {
                        var people = task.people_signedup[j];
                        data[0].what[i].people_signedup[j].lastname = people.lastname.substr(0, 1);
                    }
                }
            }

            res.json(data[0]);
        }

    });
});

router.post('/eventDetails', function(req, res) {
    var id = { _id: req.body._id };
    id._id = mongoose.mongo.ObjectId(id._id);
    Events.find(id, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data[0]);
        }

    });
});


router.post('/signUp', function(req, res) {
    Events.update({ _id: mongoose.mongo.ObjectId(req.body.eventId), "what._id": mongoose.mongo.ObjectId(req.body.whatId) }, { "$push": { "what.$.people_signedup": req.body.people } }, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }

    });
});

router.post('/removeVolunteer', function(req, res) {
    Events.update({ _id: mongoose.mongo.ObjectId(req.body.eventId), "what._id": mongoose.mongo.ObjectId(req.body.whatId) }, { "$pull": { "what.$.people_signedup": { _id: mongoose.mongo.ObjectId(req.body.volunteerId) } } }, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }

    });
});

router.post('/changeEventStatus', function(req, res) {
    Events.update({ _id: mongoose.mongo.ObjectId(req.body._id) }, { "$set": { "isDeactivated": req.body.isDeactivated } }, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }

    });
});

router.post('/deleteEvent', function(req, res) {
    Events.remove({ _id: mongoose.mongo.ObjectId(req.body._id) }, function(err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }

    });
});


router.post('/editDetails', function(req, res) {
    var json = { title: req.body.event.title, owner: req.body.event.owner }

    Events.find(json, function(err, data) {
        if (err)
            res.send(err);
        else {
            var proceed = true;
            if (data[0]) {
                if (data[0]._id != req.body.event._id) {
                    proceed = false
                }
            }
            if (proceed) {
                Events.remove({ _id: mongoose.mongo.ObjectId(req.body.event._id) }, function(err, data) {
                    if (err) {
                        res.send(err);
                    } else {
                        Events.create(req.body.event, function(err, data) {
                            if (err)
                                res.send(err);
                            else {
                                res.json(data);
                            }
                        });
                    }
                });
            } else {
                res.status(500).send("Event with the same title already exists");
            }
        }

    });
});

module.exports = router;