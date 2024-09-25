import express from 'express'

const app = express();

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
    res.send("server is ready");
})


app.listen(PORT, () => {
    console.log(`server are running port no ${PORT}`)
})

