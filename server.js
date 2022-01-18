require('dotenv').config()

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

const users = []
const posts = [
    {
        username: 'chandra',
        title: 'Approver'
    },
    {
        username: 'xyz',
        title: 'readonly'
    }
]

app.get('/users', (req,res) => {
    res.json(users)
})

app.post('/create-user', async(req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {name: req.body.name, password: hashedPassword}
        users.push(user)
        res.status(201).send()
    }catch{
        res.status(500).send()
    }
})

app.post('/login-user', async(req, res) => {
    const user = users.find(usr => usr.name === req.body.name)
    if(user == null)
    {
        return res.status(400).send("User not found")
    }

    try{
        if(await bcrypt.compare(req.body.password, user.password))
        {
            //res.send('Success')
            const username = req.body.name
            const usr = {name: username}

            const accessToken = jwt.sign(usr, process.env.ACCESS_TOKEN_SECRET)

            res.json({accessToken: accessToken})
        }
        else
        {
            res.send('User is not allowed')
        }
    }catch{
        res.status(500).send()
    }
})

app.get('/validate-user', authenticateToken, (req,res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null)
    {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(3000)