// event model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var People = new Schema({
	firstname: String,
	lastname: String,
	email: String,
	phone: Number
});

var What = new Schema({
	name: String,
	when: String,
	people_needed: Number,
	people_signedup: [People]
});

var Event = new Schema({
  title: String,
  owner: String,
  description: String,
  isDeactivated: Boolean,
  what: [What]
});

Event.index({title: 1, owner: 1}, {unique: true});

module.exports = mongoose.model('events', Event);