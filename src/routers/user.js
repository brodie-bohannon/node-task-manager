//REQUIRES
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const User = require('../models/user')
const auth = require('../middleware/auth')


const router = new express.Router()

//CREATE A NEW USER
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.firstName)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//AUTHENTICATE USER
router.post('/users/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//LOGOUT USER
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//LOGOUT ALL INSTANCES OF USER
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // clear array
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//GET CURRENTLY LOGGED IN USER
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//UPDATE A USER
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE A USER
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.firstName)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 2000000 //2MBs
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg|gif)$/)) {
            return cb(new Error('Please upload an image!'))
        }

        cb(undefined, true)
    }
})


//USER UPLOADS PROFILE PIC
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //Sharp will modify the uploaded image so we'll save the modified image in this buffer (toBuffer).
    //We also force all images to be converted as PNGs (png() provided by Sharp)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    //Access the uploaded image and save it on the req object
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//USER DELETES PROFILE PIC
router.delete('/users/me/avatar', auth, async (req, res) => {
    //Access the user's avatar variable on the user object and set it to undefined
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router