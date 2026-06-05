export interface LoginCredentials {
    identifier: string; // Can be email or display name
    password: string;
    isEmail: boolean; // true if email, false if display name (set by frontend)
}
