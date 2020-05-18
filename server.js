if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology:true})
const db = mongoose.connection
db.on('error', (error) => console.log("Database error: " + error))
db.once('open', () => console.log("Database connected!"))

app.use(express.json())

const shiftsRouter = require('./routes/shifts')
app.use('/shifts', shiftsRouter)

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const clockRouter = require('./routes/clock')
app.use('/clock', clockRouter)

app.use(function(req, res, next){
  res.status(404).json({message: "This is not a valid route!"});
})

var server = app.listen(process.env.PORT || 3000, () => console.log('Server started, listening on port ' + server.address().port))