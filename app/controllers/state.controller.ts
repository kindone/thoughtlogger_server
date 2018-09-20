
import { Router, Request, Response } from 'express'
import { Client } from 'pg'


const client = new Client({user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432})

client.connect()

const router: Router = Router()

router.get('/', (req: Request, response: Response) => {

    client.query('SELECT * from states', (err, result) => {
        // response.json(result)
        console.log('all:', result.rows)
        client.end()
    })
    response.send("OK")
})

router.get('/:id', (req: Request, response: Response) => {
    let { id } = req.params
    client.query('SELECT * from states where id = $1', [id], (err, result) => {
        // response.json(result)
        console.log('single:', result)
        client.end()
    })
    response.send(`OK, ${id}`)
})

router.post('/', (req: Request, response: Response) => {
    console.log('body:', req.body, JSON.stringify(req.body))
    client.query("INSERT INTO states (id, data) VALUES(1, $1)", [JSON.stringify(req.body)], (err, result) => {
        // response.json(result)
        console.log('single:', result, err)
        client.end()
    })
    response.send("OK")
})

router.put('/:id', (req: Request, response: Response) => {
    let { id } = req.params
    console.log('request:', req)
    response.send(`OK, ${id}`)
})

router.delete('/:id', (req: Request, response: Response) => {
    let { id } = req.params
    console.log('delete is not allowed:', req)
    response.send(`OK, ${id}`)
})

export const StateController: Router = router