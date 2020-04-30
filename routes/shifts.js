const express = require('express')
const router = express.Router()
const Shift = require('../models/shift')

// Get All Shifts
router.get('/', async(req, res) => {
    try {
        const shifts = await Shift.find()
        res.json(shifts) 
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

// Get One Shift
router.get('/:id', getShift, async(req, res) => {
    res.json(res.shift)
})

// Add One Shift
router.post('/', async (req, res) => {
    const shift = new Shift(req.body)
    try{
        const newShift = await shift.save()
        res.status(201).json(newShift)
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Update One Shift
router.post('/:id', getShift, async (req, res) => {
    if (req.body.Location != null){
        res.shift.Location = req.body.Location
    }
    if (req.body.Role != null){
        res.shift.Role = req.body.Role
    }
    if (req.body.Start != null){
        res.shift.Start = req.body.Start
    }
    if (req.body.Finish != null){
        res.shift.Finish = req.body.Finish
    }
    if (req.body.Users != null){
        res.shift.Users = req.body.Users
    }
    if (req.body.ClockIn != null){
        res.shift.ClockIn = req.body.ClockIn
    }
    if (req.body.ClockOut != null){
        res.shift.ClockOut = req.body.ClockOut
    }

    try{
        const updatedShift = await res.shift.save()
        res.json(updatedShift)
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Delete One Shift
router.delete('/:id', getShift, (req, res) => {
    try{
        res.shift.remove()
        res.json({message: 'Deleted Shift!'})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

async function getShift(req, res, next) {
    let shift
    try {
        shift = await Shift.findById(req.params.id)
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