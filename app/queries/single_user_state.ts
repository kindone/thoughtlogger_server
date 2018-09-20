import { Client } from "pg";

export const SingleUserState = {
    get: async (client:Client) =>{
        const result = await client.query('SELECT * from states where id = 1')
        return result.rows[0]
    },
    set: async (client:Client, value:JSON) => {
        await client.query("UPDATE states set data = $1", [JSON.stringify(value)])
    }
}