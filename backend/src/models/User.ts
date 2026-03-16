// In the future, I will link this to the database table

export interface User {
    id: number;
    email: string;
    username: string;
    password: string;
    status: string;
    profile_picture?: string
}
