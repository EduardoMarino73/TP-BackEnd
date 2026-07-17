import { ObjectId } from "mongodb"

export interface Repository <T>{
    findOne(item:{id:string}): Promise<T | undefined>
    findAll(): Promise<T[] | undefined>
    create(item: T): Promise<T | undefined>
    update(id:ObjectId,input: T): Promise<T | undefined>
    delete(item:{id:string}): Promise<{_id:ObjectId} | undefined>
}