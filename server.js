var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var user = process.env.DB_USER
var pass = process.end.DB_PASS

var dbUrl = `mongodb+srv://${user}:${pass}@clockin-ocbha.mongodb.net/ClockIn?retryWrites=true&w=majority`

print(dbUrl)

const port = process.env.PORT || 3000;

var Shift = mongoose.model('Shift', {
    start: Number, 
    finish: Number,
    location: String,
    role: String
})

var UserShift = mongoose.model("UserShift", {
    userID: String,
    shiftID: String
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
        var shift = new Shift(req.body)
        var savedShift = shift.save()
        res.sendStatus(200)
    }
    catch (error){
        console.log(error)
    }
})

app.post('/shifts/assign', (req, res) => {

    try{
        var userShift = new UserShift(req.body)
        var savedShift = userShift.save()
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
    var date = new Date("2020-02-27T16:00:00.000Z")
    console.log(date.getTime());
})
