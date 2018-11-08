
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
    Document.findByID(client, req.params.id as string).then((result) => {
        response.json(result)
    }).catch(() => {
        response.sendStatus(500)
    })
})

router.get('/', (req: Request, response: Response) => {
    const prefix = req.query['prefix'] || ''
    Document.allByURIPrefix(client, prefix).then((result) => {
        response.json(result)
    }).catch(() => {
        response.sendStatus(500)
    })
})

router.post('/', (req: Request, response: Response) => {
    const uri = req.body.uri as string
    const rev = req.body.rev as number
    const content = req.body.content as string
    Document.insert(client, uri, rev, content).then((result) =>{
        // setTimeout((function() {response.json(result)}), 5000)
        response.json(result)
    }).catch((err) => {
        console.log('POST error:', err)
        // setTimeout((function() {response.sendStatus(500)}), 5000)
        response.sendStatus(500)
    })

})

//Disabled due to history based update

// router.put('/:id', (req: Request, response: Response) => {
//     const id = req.params.id as string
//     // const delta = req.body.delta! as string
//     const rev = req.body.rev as number
//     const content = req.body.content! as string

//     Document.update(client, id, rev, content).then(() =>{
//         response.send()
//     }).catch((err) => {
//         console.log('PUT error:', err)
//         response.sendStatus(500)
//     })
// })

router.put('/:id/uri', (req: Request, response: Response) => {
    const id = req.params.id as string
    const uri = req.body.uri as string
    Document.move(client, id, uri).then(() =>{
        response.send()
    }).catch((err) => {
        console.log('PUT error:', err)
        response.sendStatus(500)
    })
})

router.delete('/:id', (req: Request, response: Response) => {
    const id = req.params.id as string
    Document.delete(client, id).then(() =>{
        response.send()
    }).catch((err) => {
        console.log('DELETE error:', err)
        response.sendStatus(500)
    })
})

export const DocumentController: Router = router