const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  totpSecret: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Student', studentSchema);
