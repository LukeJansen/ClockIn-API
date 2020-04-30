const express = require('express')
const router = express.Router()
const User = require('../models/user')

// Get All Users
router.get('/', async(req, res) => {
    try {
        const users = await User.find()
        res.json(users) 
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

// Get One User
router.get('/:id', getUser, async(req, res) => {
    res.json(res.user)
})

// Add One User
router.post('/', async (req, res) => {
    const user = new User(req.body)
    try{
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Update One User
router.post('/:id', getUser, async (req, res) => {
    
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
        res.json(updatedUser)
    } catch (err){
        res.status(400).json({message: err.message})
    }
})

// Delete One User
router.delete('/:id', getUser, (req, res) => {
    try{
        res.user.remove()
        res.json({message: 'Deleted Shift!'})
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