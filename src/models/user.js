const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /\S+@\S+\.\S+/
    },
    senha: {
        type: String,
        required: true,
        minlength: 6
    }
}, {
    collection: 'usuarios'
});

module.exports = userSchema;