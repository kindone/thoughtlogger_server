import {IHistory, JSONStringify} from  'text-versioncontrol'
import Delta = require('quill-delta')
import { IDelta } from 'text-versioncontrol'
import { StringWithState } from 'text-versioncontrol'
import { ISyncRequest, ISavepoint, ISyncResponse } from 'text-versioncontrol/lib/History'
import * as _ from 'underscore'
import { History as HistoryInPG} from '../queries/history'
import { Checkpoint } from '../queries/checkpoint'
import { Client } from 'pg';
import { Document } from '../queries/document';

class DeltasProxy {
    constructor(private client:Client, public readonly documentId:string) {

    }
    async getCurrentRev() {
        const rev = await HistoryInPG.lastestRevByDocumentID(this.client, this.documentId)
        return rev
    }

    async getChange(rev:number) {
        return HistoryInPG.findChange(this.client, this.documentId, rev)
    }

    async getChangesFrom(rev:number) {
        return HistoryInPG.findChangesFrom(this.client, this.documentId, rev)
    }

    async getChangesFromTo(fromRev:number, toRev:number) {
        return HistoryInPG.findChangesFromTo(this.client, this.documentId, fromRev, toRev)
    }

    async append(deltas:IDelta[]):Promise<number> {
        const deltaStrs = _.map(deltas, (delta:IDelta) => {
            return JSON.stringify(deltas)
         })
        return HistoryInPG.append(this.client, this.documentId, deltaStrs)
    }
}

class CheckpointProxy {
    constructor(private client:Client, public readonly documentId:string) {

    }

    getLatestCheckpointRev():Promise<number> {
        return Checkpoint.lastestRevByDocumentID(this.client, this.documentId)
    }

    async getLatestCheckpointForRev(rev:number):Promise<ISavepoint> {
        return await Checkpoint.findLastestForRevByDocumentID(this.client, this.documentId, rev) as ISavepoint
    }

    insert(rev:number, content:IDelta) {
        return Checkpoint.insert(this.client, this.documentId, rev, JSON.stringify(content))
    }
}

class DocumentProxy {
    constructor(private client:Client, public readonly documentId:string) {

    }

    async update(rev:number, content:IDelta) {
        return Document.update(this.client, this.documentId, rev, JSONStringify(content))
    }
}

export class History
{
    public static readonly MIN_SAVEPOINT_RATE = 20

    private checkpoints:CheckpointProxy
    private changes:DeltasProxy
    private document:DocumentProxy

    constructor(client:Client, public readonly documentId:string) {
        this.checkpoints = new CheckpointProxy(client, documentId)
        this.changes = new DeltasProxy(client, documentId)
        this.document = new DocumentProxy(client, documentId)
    }

    public async append(deltas: IDelta[], name?: string): Promise<number> {
        return (await this.mergeAt(await this.getCurrentRev(), deltas, name)).rev
    }

    public merge(mergeRequest: ISyncRequest): Promise<ISyncResponse> {
        return this.mergeAt(mergeRequest.baseRev, mergeRequest.deltas, mergeRequest.branchName)
    }

    public async simulate(deltas: IDelta[], name: string): Promise<IDelta>
    {
        const result = await this.simulateMerge(name, deltas, await this.getCurrentRev())
        return result.content
    }

    public getCurrentRev(): Promise<number> {
        return this.changes.getCurrentRev()
    }

    public async getContent(): Promise<IDelta> {
        return this.getContentForRev(await this.getCurrentRev())
    }

    public async getContentForRev(rev: number): Promise<IDelta> {
        const checkpoint = await this.getNearestCheckpointForRev(rev)
        const ss = StringWithState.fromDelta(checkpoint.content)

        const deltas = await this.changes.getChangesFromTo(checkpoint.rev, rev)
        for (const delta of deltas)
            ss.apply(delta, '_')

        return ss.toDelta()
    }

    public getChanges(fromRev:number, toRev:number = -1): Promise<IDelta[]> {
        if(toRev >= 0)
            return this.changes.getChangesFromTo(fromRev, toRev)
        else
            return this.changes.getChangesFrom(fromRev)
    }

    private async mergeAt(baseRev: number, deltas: IDelta[], name?: string): Promise<ISyncResponse> {
        const baseToCurr = await this.getChanges(baseRev)
        const result = await this.simulateMerge(name ? name : this.documentId, deltas, baseRev)

        const rev = await this.changes.append(result.deltas)
        this.document.update(rev, result.content)

        if (await this.getLatestCheckpointRev() + History.MIN_SAVEPOINT_RATE < await this.getCurrentRev()) {
            this.doSavepoint(await this.getCurrentRev(), result.content)
        }
        return {rev, deltas: baseToCurr}
    }

    private async simulateMerge(
        name: string,
        remoteDeltas: IDelta[],
        baseRev: number
    ): Promise<{ deltas: IDelta[]; content: IDelta }> {
        const baseRevContent = await this.getContentForRev(baseRev)
        const ss = StringWithState.fromDelta(baseRevContent)
        let newDeltas: IDelta[] = []

        const deltas = await this.changes.getChangesFrom(baseRev)

        for (const delta of deltas)
            ss.apply(delta, this.documentId)

        for (const delta of remoteDeltas)
            newDeltas = newDeltas.concat(ss.apply(delta, name))

        return { deltas: newDeltas, content: ss.toDelta() }
    }

    private doSavepoint(rev: number, content: IDelta): void {
        this.checkpoints.insert(rev, content)
    }

    private getLatestCheckpointRev(): Promise<number> {
        return this.checkpoints.getLatestCheckpointRev()
    }

    private getNearestCheckpointForRev(rev: number): Promise<ISavepoint> {
        return this.checkpoints.getLatestCheckpointForRev(rev)
    }
}