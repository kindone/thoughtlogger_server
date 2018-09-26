
import { Router, Request, Response } from 'express'
import { Client } from 'pg'
import { Document } from '../queries/document'

const client = new Client({user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432})

client.connect()

const router: Router = Router()


router.get('/:id', (req: Request, response: Response) => {
    Document.findByID(client, req.params.id as string).then((res) => {
        response.json(res)
    }).catch(() => {
        response.status(500)
    })
})

router.get('/', (req: Request, response: Response) => {
    const prefix = req.query['prefix'] || ''
    Document.allByURIPrefix(client, prefix).then((res) => {
        response.json(res)
    }).catch(() => {
        response.status(500)
    })
})

router.post('/', (req: Request, response: Response) => {
    const uri = req.body.uri as string
    const content = req.body.content as string
    Document.insert(client, uri, content).then(() =>{
        response.send()
    }).catch(() => {
        response.status(500)
    })
})

router.put('/:id', (req: Request, response: Response) => {
    const id = req.params.id as string
    const uri = req.body.uri as string
    const content = req.body.content as string
    Document.update(client, id, uri, content).then(() =>{
        response.send()
    }).catch(() => {
        response.status(500)
    })
})

export const DocumentController: Router = router