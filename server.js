var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var user = process.env.DB_USER
var pass = process.env.DB_PASS

user = "admin"
pass = "nU.wAAFTrLxHu-A-.3jH"

var dbUrl = `mongodb+srv://${user}:${pass}@clockin-ocbha.mongodb.net/ClockIn?retryWrites=true&w=majority`

const port = process.env.PORT || 3000;

var Shift = mongoose.model('Shift', {
    Start: String, 
    Finish: String,
    Location: String,
    Role: String,
    Users: Array,
    ClockIn: Map,
    ClockOut: Map
})

var User = mongoose.model("User", {
    FirstName: String,
    LastName: String,
    Email: String,
    Phone: String,
    DOB: Date,
    Type: Number
})

// DEFAULT API

app.get('/', (req, res) => {
    res.send("Welcome to the ClockIn API!")
})

// SHIFT API

app.get('/shifts', (req, res) => {
    Shift.find({}, (err, shifts) => {
        res.send(shifts)
    })
})

app.get('/shifts/dateSearch', (req, res) => {

    try{
        var startDate = req.query.start
        var finishDate = req.query.finish

        Shift.find({start: {$gte: startDate}, finish: {$lte: finishDate}}, (err, shifts) => {
            res.send(shifts)
        })
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.get('/shifts/user', async (req, res) => {

    try{
        var userID = req.query.userID
        var shiftIDList = []
        var shiftList = []
        var completedIDSearch = await UserShift.find({userID: userID}, (err, usershifts) => {
            usershifts.forEach(element => {
                shiftIDList.push(element.shiftID)
            }, this)
        })

        var completedShiftSearch = await Shift.find({_id: {$in: shiftIDList}}, (err, shifts) => {
            res.send(shifts)
        })
    }
    catch(error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/shifts', (req, res) => {

    try{
        delete req.body._ID
        var shift = new Shift(req.body)
        var savedShift = shift.save()
        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/shifts/update', async (req, res) => {

    try{
        var shift = await Shift.findOne({_id:req.body._ID})

        shift.Location = req.body.Location
        shift.Role = req.body.Role
        shift.Start = req.body.Start
        shift.Finish = req.body.Finish
        shift.Users = req.body.Users
        shift.ClockIn = req.body.ClockIn
        shift.ClockOut = req.body.ClockOut

        shift.save()

        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/shifts/delete', async (req, res) => {

    try{
        var shift = await Shift.deleteOne({_id:req.body._ID})
        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

// USER API

app.get('/users', (req, res) => {
    User.find(req.query, (err, users) => {
        res.send(users)
    })
})

app.post('/users', (req, res) => {

    try{
        var user = new User(req.body)
        var savedUser = user.save()
        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/users/update', async (req, res) => {

    try{
        var user = await User.findOne({_id:req.body._ID})

        user.FirstName = req.body.FirstName
        user.LastName = req.body.LastName
        user.Email = req.body.Email
        user.Phone = req.body.Phone
        user.DOB = req.body.DOB
        user.Type = req.body.Type

        user.save()

        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/users/delete', async (req, res) => {

    try{
        var user = await User.deleteOne({_id:req.body._ID})
        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/clock/in', async (req, res) => {

    try{
        var shift = await Shift.findOne({_id:req.body.shiftID})
        
        if(shift.ClockIn.has(req.body.userID)){
            res.status(400).send("User has already clocked in!")
        }
        else if (!shift.Users.includes(req.body.userID)){
            res.status(400).send("User is not assigned to this shift!")
        }
        else{
            var time = new Date()
            shift.ClockIn.set(req.body.userID, time.toISOString())
        }

        shift.save()
        res.status(200).send("User clocked in!")
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/clock/out', async (req, res) => {

    try{
        var shift = await Shift.findOne({_id:req.body.shiftID})

        if(shift.ClockOut.has(req.body.userID)){
            res.status(400).send("User has already clocked out!")
        }
        if(!shift.ClockIn.has(req.body.userID)){
            res.status(400).send("User has not clocked in!")
        }
        else if (!shift.Users.includes(req.body.userID)){
            res.status(400).send("User is not assigned to this shift!")
        }
        else{
            var time = new Date()
            shift.ClockOut.set(req.body.userID, time)
        }

        shift.save()
        res.status(200).send("User clocked out!")
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/clock/check', async (req, res) => {

    try{
        var shift = await Shift.findOne({_id:req.body.shiftID})

        if (shift.ClockIn.has(req.body.userID)) var cin = true
        if (shift.ClockOut.has(req.body.userID)) var cout = true

        if (!cin && !cout) res.status(200).send("No ClockIn Status")
        if (cin && !cout) res.status(200).send("Clocked In")
        if (cin && cout) res.status(200).send("Clocked Out")

        res.status(400).send("Data Error")
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

app.post('/clock/reset', async (req, res) => {

    try{
        var shift = await Shift.findOne({_id:req.body.shiftID})

        if (shift.ClockIn.has(req.body.userID)) shift.ClockIn.delete(req.body.userID)
        if (shift.ClockOut.has(req.body.userID)) shift.ClockOut.delete(req.body.userID)

        shift.save()
        res.status(200).send("User clock status reset!")
    }
    catch (error){
        console.log(error)
        res.sendStatus(400)
    }
})

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true},(error) => {
    if (error){
        console.log("MongoDB Connection Failed. Error: ", error.errmsg)
    }
    else{
        console.log("MongoDB Connection Established Successfully!")
    }
})

var server = app.listen(port, () => {
    console.log("Server is listening on port", server.address().port)
})
