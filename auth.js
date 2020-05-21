const axios = require('axios')

const checkUrl = "http://auth.clockin.uk/token/check"

async function adminCheck(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).json({message: "Authorisation Not Provided!"})

    axios.post (checkUrl, {
        AccessToken: token,
        UserType: 1
    }).then((response) => {
        if (response.status === 200) next()
    }).catch((error) => {
        return res.status(403).json({message: error.response.data.message})
    })
}

async function userCheck(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    console.log(authHeader)

    if (token == null) return res.status(401).json({message: "Authorisation Not Provided!"})

    axios.post (checkUrl, {
        AccessToken: token,
        UserType: 0
    }).then((response) => {
        if (response.status === 200) next()
    }).catch((error) => {
        return res.status(403).json({message: error.response.data.message})
    })
}

module.exports.adminCheck = adminCheck
module.exports.userCheck = userCheck