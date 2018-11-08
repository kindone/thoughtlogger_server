require('source-map-support').install()
//import 'source-map-support/register
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as morgan from 'morgan'

import { SingleuserStateController, DocumentController } from './controllers'

// Create a new express application instance
const app: express.Application = express()

const port: number = process.env.PORT  ? parseInt(process.env.PORT) : 4000

const allowCrossDomain = (req:express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
}

app.use(morgan('combined'))

app.use(allowCrossDomain)

app.use(bodyParser.json())

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
        console.log('Invalid Request data:', err)
        res.send('Invalid Request data')
    } else {
        next()
    }
})

app.use('/state', SingleuserStateController)

app.use('/document', DocumentController)

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`)
})
