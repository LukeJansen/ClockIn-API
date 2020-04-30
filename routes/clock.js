const express = require('express')
const router = express.Router()
const Shift = require('../models/shift')
const User = require('../models/user')

// Clock In
router.post('/in', getUser, getShift, (req, res) => {
    if (!res.shift.Users.includes(res.user._id)){
        return res.status(400).json({message: "User is not assigned to this shift!"})
    }
    else if(res.shift.ClockIn.has(res.user._id)){
        return res.status(400).json({message: "User has already clocked in!"})
    }
    else{
        var time = new Date()
        res.shift.ClockIn.set(res.user._id, time.toISOString())
    }

    res.shift.save()
    res.json({message: "User clocked in!"})
})

// Clock Out
router.post('/out', getUser, getShift, (req, res) => {
    if (!res.shift.Users.includes(res.user._id)){
        return res.status(400).json({message: "User is not assigned to this shift!"})
    }
    else if(res.shift.ClockOut.has(res.user._id)){
         return res.status(400).json({message: "User has already clocked out!"})
    }
    else if(!res.shift.ClockIn.has(res.user._id)){
         return res.status(400).json({message: "User has not clocked in!"})
    }
    else{
        var time = new Date()
        res.shift.ClockOut.set(res.user._id, time.toISOString())
    }

    res.shift.save()
    res.status(200).json({message: "User clocked out!"})
})

// Clock Check
router.get('/check', getUser, getShift, (req, res) => {
    if (res.shift.ClockIn.has(res.user._id)) var cin = true
    if (res.shift.ClockOut.has(res.user._id)) var cout = true

    if (!res.shift.Users.includes(res.user._id)) return res.status(400).json({message: "User is not assigned to this shift!"})
    if (!cin && !cout) return res.status(200).json({message: "No ClockIn Status"})
    if (cin && !cout) return res.status(200).json({message: "Clocked In"})
    if (cin && cout) return res.status(200).json({message: "Clocked Out"})

    res.status(400).json({message: "Data Error"})
})

// Clock Reset
router.delete('/reset', getUser, getShift, (req, res) => {
    if (res.shift.ClockIn.has(res.user._id)) shift.ClockIn.delete(res.user._id)
    if (res.shift.ClockOut.has(res.user._id)) shift.ClockOut.delete(res.user._id)

    res.shift.save()
    res.status(200).send("User clock status reset!")
})

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.body.UserID)
        if (user == null){
            return res.status(404).json({message: "Cannot find user with given id!"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.user = user
    next()
}

async function getShift(req, res, next) {
    let shift
    try {
        shift = await Shift.findById(req.body.ShiftID)
        if (shift == null){
            return res.status(404).json({message: "Cannot find user with given id!"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.shift = shift
    next()
}

module.exports = router