import { Client } from "pg";
import { IDelta, ISyncRequest } from "text-versioncontrol";
import { History } from "../util/history";

export const DocumentWithHistory = {
    sync: async (client:Client, documentId:string, syncRequest:ISyncRequest) => {
        try {
            const history = new History(client, documentId)
            client.query("BEGIN")
            const result = history.merge(syncRequest)
            client.query("COMMIT")
            return result
        }
        catch(error)
        {
            console.error(error)
            throw error
        }

    }
}