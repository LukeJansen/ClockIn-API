const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Auth = require('../auth')

// Get All Users
router.get('/', Auth.adminCheck, async(req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users) 
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

// Get One User
router.get('/:id', Auth.userCheck, getUser, async(req, res) => {
    if (res.user._id == req.body.UserID){
        res.status(200).json(res.user)
    } else{
        res.status(403).json({message: "User can only view their own details."})
    }
})

// Add One User
router.post('/', Auth.adminCheck, async (req, res) => {
    const user = new User(req.body)
    try{
        const newUser = await user.save()
        res.status(201).json({message: newUser.toString(), UserID: newUser._id})
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Update One User
router.post('/:id', Auth.adminCheck, getUser, async (req, res) => {
    
    if (req.body.FirstName != null){
        res.user.FirstName = req.body.FirstName
    }
    if (req.body.LastName != null){
        res.user.LastName = req.body.LastName
    }
    if (req.body.Email != null){
        res.user.Email = req.body.Email
    }
    if (req.body.Phone != null){
        res.user.Phone = req.body.Phone
    }
    if (req.body.DOB != null){
        res.user.DOB = req.body.DOB
    }
    if (req.body.Type != null){
        res.user.Type = req.body.Type
    }

    try{
        const updatedUser = await res.user.save()
        res.status(200).json(updatedUser)
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Delete One User
router.delete('/:id', Auth.adminCheck, getUser, (req, res) => {
    try{
        res.user.remove()
        res.status(200).json({message: 'Deleted Shift!'})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.params.id)
        if (user == null){
            return res.status(404).json({message: "Cannot find user with given id!"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.user = user
    next()
}

module.exports = router