const mongoose = require("mongoose");
const {URI} = require('../config');
const Schema = mongoose.Schema;


mongoose.connect(URI).then(()=>{console.log('user-db connected')})

// Define the student schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  accounId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

const accountSchema = new Schema({
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    balance: {
      type:Number,
      required: true
    }
})

const Account = mongoose.model('Account',accountSchema);

// Export the model
module.exports = {
  User,
  Account
}
