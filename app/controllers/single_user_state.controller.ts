
import { Router, Request, Response } from 'express'
import { Client } from 'pg'
import { SingleUserState } from '../queries/single_user_state';


const client = new Client({user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432})

client.connect()

const router: Router = Router()

router.get('/', (req: Request, response: Response) => {
    SingleUserState.get(client).then((res) => {
        response.json(res)
    }).catch(() => {
        response.status(500)
    })
})

router.put('/', (req: Request, response: Response) => {
    SingleUserState.set(client, req.body).then(() =>{
        response.send()
    }).catch(() => {
        response.status(500)
    })
})

export const SingleuserStateController: Router = router