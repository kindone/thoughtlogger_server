import { Client } from "pg";
import { Checkpoint } from "./checkpoint";

export const Document = {
    findByID: async (client:Client, id:string) => {
        const result = await client.query('SELECT * from document where id = $1', [id])
        return result.rows[0]
    },
    findByURI: async (client:Client, uri:string) => {
        const result = await client.query('SELECT * from document where uri = $1', [uri])
        return result.rows[0]
    },
    allByURIPrefix: async (client: Client, prefix:string) => {
        const result = await client.query('SELECT * from document where uri LIKE $1', [prefix + '%'])
        return result.rows
    },
    insert:  async (client:Client, uri:string, rev:number, content:string) => {
        try {
            client.query('BEGIN')
            const result = await client.query('select md5(random()::text || clock_timestamp()::text)::uuid as id')
            const id = result.rows[0].id
            await client.query('insert into document (id, uri, revision, content) VALUES($1, $2, $3, $4)', [id, uri, rev, content])
            Checkpoint.insert(client, id, rev, content)
            client.query('COMMIT')
            return {id, uri}
        }
        catch(error) {
            console.error(error)
            throw error
        }
    },
    update: async (client:Client, id:string, rev:number, content:string) => {
        const result = await client.query("UPDATE document set revision = $2, content = $3 where id = $1", [id, rev, content])
        return result
    },
    move: async (client:Client, id:string, uri:string) => {
        const result = await client.query("UPDATE document set uri = $2 where id = $1", [id, uri])
        return result
    },
    delete: async (client:Client, id:string)  => {
        const result = await client.query("delete from document where id = $1", [id])
        return result
    }
}