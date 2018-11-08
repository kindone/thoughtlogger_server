import { Client } from "pg";
import { IDelta } from "text-versioncontrol";

export const Checkpoint = {

    findAllByDocumentID: async (client:Client, document_id:string) => {
        console.log("Checkpoint.findAllByDocumentID:", document_id)
        const result = await client.query('SELECT * from checkpoint where document_id = $1 order by revision ASC', [document_id])
        return result.rows
    },
    lastestRevByDocumentID: async (client:Client, document_id:string) => {
        console.log("Checkpoint.lastestRevByDocumentID:", document_id)
        const result = await client.query('SELECT coalesce(MAX(revision), 0) as max_rev from checkpoint where document_id = $1', [document_id])
        console.log("Checkpoint.lastestRevByDocumentID.result", result)
        return result.rows[0].max_rev as number
    },
    findLastestForRevByDocumentID: async (client:Client, document_id:string, revision:number) => {
        console.log("Checkpoint.findLastestForRevByDocumentID:", document_id, revision)
        const result = await client.query('SELECT * from checkpoint where document_id = $1 and revision <= $2 order by revision DESC LIMIT 1', [document_id, revision])
        return result.rows[0]
    },
    insert:  async (client:Client, document_id:string, revision:number, content:string) => {
        console.log("Checkpoint.insert:", document_id, revision, content)
        const result = await client.query('insert into checkpoint (document_id, revision, content) VALUES($1, $2, $3)', [document_id, revision, content])
        return result
    },
    update: async (client:Client, document_id:string, revision:number, content:string) => {
        console.log("Checkpoint.update:", document_id, revision, content)
        const result = await client.query("UPDATE checkpoint set content = $3 where document_id = $1 and revision = $2", [document_id, revision, content])
        return result
    },
    delete: async (client:Client, document_id:string, revision:number)  => {
        console.log("Checkpoint.delete:", document_id, revision)
        const result = await client.query("delete from checkpoint where document_id = $1 and revision = $2", [document_id, revision])
        return result
    }
}