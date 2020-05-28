const express = require('express')
const router = express.Router()
const Shift = require('../models/shift')
const User = require('../models/user')
const Auth = require('../auth')

// Clock In
router.post('/in', Auth.userCheck ,getUser, getShift, (req, res) => {

    if (!res.shift.Users.includes(req.body.UserID)){
        return res.status(400).json({message: "User is not assigned to this shift!"})
    }
    else if(res.shift.ClockIn.has(req.body.UserID)){
        return res.status(400).json({message: "User has already clocked in!"})
    }
    else{
        var time = new Date()
        res.shift.ClockIn.set(req.body.UserID, time.toISOString())
    }

    res.shift.save()
    res.status(200).json({message: "User clocked in!"})
})

// Clock Out
router.post('/out', Auth.userCheck, getUser, getShift, (req, res) => {
    if (!res.shift.Users.includes(req.body.UserID)){
        return res.status(400).json({message: "User is not assigned to this shift!"})
    }
    else if(res.shift.ClockOut.has(req.body.UserID)){
         return res.status(400).json({message: "User has already clocked out!"})
    }
    else if(!res.shift.ClockIn.has(req.body.UserID)){
         return res.status(400).json({message: "User has not clocked in!"})
    }
    else{
        var time = new Date()
        res.shift.ClockOut.set(req.body.UserID, time.toISOString())
    }

    res.shift.save()
    res.status(200).json({message: "User clocked out!"})
})

// Clock Check
router.get('/check', Auth.userCheck, getUser, getShift, (req, res) => {
    if (res.shift.ClockIn.has(req.body.UserID)) var cin = true
    if (res.shift.ClockOut.has(req.body.UserID)) var cout = true

    if (!res.shift.Users.includes(req.body.UserID)) return res.status(400).json({message: "User is not assigned to this shift!"})
    if (!cin && !cout) return res.status(200).json({message: "No ClockIn Status"})
    if (cin && !cout) return res.status(200).json({message: "Clocked In"})
    if (cin && cout) return res.status(200).json({message: "Clocked Out"})

    res.status(400).json({message: "Data Error"})
})

// Clock Reset
router.post('/reset', Auth.adminCheck, getUser, getShift, (req, res) => {
    if (res.shift.ClockIn.has(req.body.UserID)) res.shift.ClockIn.delete(req.body.UserID)
    if (res.shift.ClockOut.has(req.body.UserID)) res.shift.ClockOut.delete(req.body.UserID)

    res.shift.save()
    res.status(200).send("User clock status reset!")
})

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.body.UserID)
        console.log(req.body)
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