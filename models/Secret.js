const mongoose = require('mongoose');
const {Schema} = mongoose;
const SecretSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
});


const Secret = mongoose.model('secrets', SecretSchema);
module.exports = Secret