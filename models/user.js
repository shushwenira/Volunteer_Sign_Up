var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  firstname: String,
  lastname: String,
  organization: String,	
  username: String,
  password: String,
  securityQuestion:String,
  securityAnswer:String
});

User.index({username: 1}, {unique: true});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);