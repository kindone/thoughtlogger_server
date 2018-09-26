import { Client } from "pg";

export const SingleUserState = {
    get: async (client:Client) => {
        const result = await client.query('SELECT * from state where id = 1')
        return result.rows[0] as string
    },
    set: async (client:Client, value:JSON) => {
        await client.query("UPDATE state set data = $1", [JSON.stringify(value)])
    }
}