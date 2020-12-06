
import express from 'express'
import routes from './src/routes.js'

const app = express();
const port = 3007;

app.use(express.json());
app.use('/', routes);

export default app.listen(port, function () {
  console.log(`API server ready on http://localhost:${port}`);
});