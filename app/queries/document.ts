import { Client } from "pg";

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
    insert:  async (client:Client, uri:string, content:string) => {
        const result = client.query('insert into document (id, uri, content) VALUES(md5(random()::text || clock_timestamp()::text)::uuid, $1, $2)', [uri, content])
        return result
    },
    update: async (client:Client, id:string, content:string) => {
        const result = await client.query("UPDATE document set content = $2 where id = $1", [id, content])
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