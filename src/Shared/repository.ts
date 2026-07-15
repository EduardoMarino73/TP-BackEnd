import { ObjectId } from "mongodb"

export interface Repository <T>{
    findOne(item:{id:string}): Promise<T | undefined>
    findAll(): Promise<T[] | undefined>
    add(item: T): Promise<T | undefined>
    update(item: T): Promise<T | undefined>
    delete(item:{id:string}): Promise<{_id:ObjectId} | undefined>
}