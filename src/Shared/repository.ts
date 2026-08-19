export interface Repository<T> {
    findOne(id: number): Promise<T | undefined>
    findAll(): Promise<T[]>
    create(item: T): Promise<T>
    update(id: number, input: Partial<T>): Promise<T | undefined>
    delete(id: number): Promise<boolean>
}
