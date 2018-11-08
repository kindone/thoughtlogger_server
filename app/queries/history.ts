import { Client } from "pg";
import { IDelta } from "text-versioncontrol";

export const History = {
    findChange:  async (client:Client, document_id:string, revision:number) => {
        console.log("History.findChange:", document_id, revision)
        const result = await client.query('SELECT * from history where document_id = $1 and revision = $2', [document_id, revision])
        return result.rows[0]
    },
    findChangesFrom: async (client:Client, document_id:string, revision:number) => {
        console.log("History.findChangesFrom:", document_id, revision)
        const result = await client.query('SELECT * from history where document_id = $1 and revision >= $2', [document_id, revision])
        return result.rows as IDelta[]
    },
    findChangesFromTo: async (client:Client, document_id:string, fromRev:number, toRev:number) => {
        console.log("History.findChangesFromTo:", document_id, fromRev, toRev)
        const result = await client.query('SELECT * from history where document_id = $1 and revision >= $2 and revision <= $3', [document_id, fromRev, toRev])
        return result.rows as IDelta[]
    },
    findAllChanges: async (client:Client, document_id:string) => {
        console.log("History.findAllChanges:", document_id)
        const result = await client.query('SELECT * from history where document_id = $1 order by revision ASC', [document_id])
        return result.rows as IDelta[]
    },
    lastestRevByDocumentID: async (client:Client, document_id:string) => {
        console.log("History.History.lastestRevByDocumentID:", document_id)
        const result = await client.query('SELECT MAX(revision) as max_rev from history where document_id = $1', [document_id])
        return result.rows[0].max_rev as number
    },
    insert:  async (client:Client, document_id:string, revision:number, delta:string) => {
        console.log("History.insert:", document_id, revision, delta)
        const result = await client.query('insert into history (document_id, revision, delta) VALUES($1, $2, $3)', [document_id, revision, delta])
        return result
    },
    append: async (client:Client, document_id:string, deltas:string[]) => {
        console.log("History.append:", document_id, deltas)
        const result = await client.query('SELECT MAX(revision) as max_rev from history where document_id = $1', [document_id])
        let revision = result.rows[0].max_rev as number + 1
        for(const delta of deltas)
            client.query('insert into history (document_id, revision, delta) VALUES($1, $2, $3)', [document_id, revision++, delta])

        return revision
    },
    update: async (client:Client, document_id:string, revision:number, delta:string) => {
        console.log("History.update:", document_id, revision, delta)
        const result = await client.query("UPDATE history set delta = $3 where document_id = $1 and revision = $2", [document_id, revision, delta])
        return result
    },
    delete: async (client:Client, document_id:string, revision:number)  => {
        console.log("History.delete:", document_id, revision)
        const result = await client.query("delete from history where document_id = $1 and revision = $2", [document_id, revision])
        return result
    }
}