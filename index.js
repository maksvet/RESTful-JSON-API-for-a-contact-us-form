import express from 'express'
const app = express()
const port = 3007
app.use(express.json())
app.listen(port, () => console.log(`API server ready on http://localhost:${port}`))