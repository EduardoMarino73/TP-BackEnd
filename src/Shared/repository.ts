export interface Repository<T> {
    findOne(id: number): Promise<T | undefined>
    findAll(): Promise<T[]>
    create(item: T): Promise<T>
    update(id: number, input: Partial<T>): Promise<T | undefined>
    delete(id: number): Promise<boolean>
}

/**
 * Keeps only the listed fields that input defines. Repositories use it so an edit
 * can only change the fields a user is allowed to change.
 */
export function pickDefined<T, K extends keyof T>(input: Partial<T>, fields: readonly K[]): Partial<Pick<T, K>> {
    const picked: Partial<Pick<T, K>> = {};
    fields.forEach((field) => {
        if (input[field] !== undefined) picked[field] = input[field];
    });
    return picked;
}
