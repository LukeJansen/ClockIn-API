var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var user = process.env.DB_USER
var pass = process.env.DB_PASS

var dbUrl = `mongodb+srv://${user}:${pass}@clockin-ocbha.mongodb.net/ClockIn?retryWrites=true&w=majority`

const port = process.env.PORT || 3000;

var Shift = mongoose.model('Shift', {
    Start: String, 
    Finish: String,
    Location: String,
    Role: String,
    Users: Array
})

var User = mongoose.model("User", {
    firstName: String,
    lastName: String,
    email: String,
    phone: Number,
    dateOfBirth: Date
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
