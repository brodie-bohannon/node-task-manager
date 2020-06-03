//REQUIRES
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

//SET UP EXPRESS AND THE PORTS THE SERVER WILL USE
const app = express()
const port = process.env.PORT

//CONFIGURE EXPRESS
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//START SERVER WITH CALLBACK
app.listen(port, () => {
    console.log('Server is online using port ' + port + '...')
})