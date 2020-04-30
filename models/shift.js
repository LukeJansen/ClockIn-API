const mongoose = require('mongoose')

const shiftSchema = new mongoose.Schema({
    Start: {
        type: String,
        required: true
    },
    Finish: {
        type: String,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    Role: {
        type: String,
        required: true
    },
    Users: {
        type: Array,
        required: true
    },
    ClockIn: {
        type: Map,
        required: true
    },
    ClockOut: {
        type: Map,
        required: true
    }
})

module.exports = mongoose.model('Shift', shiftSchema)