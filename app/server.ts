import * as express from 'express'
import * as bodyParser from 'body-parser'

import { StateController } from './controllers'

// Create a new express application instance
const app: express.Application = express()

const port: number = process.env.PORT  ? parseInt(process.env.PORT) : 3000

app.use(bodyParser.json())

app.use('/state', StateController)

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`)
})