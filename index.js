
import express from 'express'
import routes from './src/routes.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express();
const port = process.env.PORT || 3008

app.use(express.json());
app.use('/', routes);
app.use((req, res, next) => {
    return res.status(404).send({
    status: 404,
    message: "not found"
    })
    next(error)
})

// error handler middleware
app.use((error, req, res, next) => {
    return res.status(error.status || 500).send({
        error: {
        status: error.status || 500,
        message: "Internal Server Error",
        },
    });
});

export default app.listen(port, function () {
  console.log(`API server ready on http://localhost:${port}`);
});