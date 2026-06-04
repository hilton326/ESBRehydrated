// Linked to Accounts table in the database

export interface Account {
    id: number;
    status: boolean,
    email: string,
    name: string,
    password: string
}
