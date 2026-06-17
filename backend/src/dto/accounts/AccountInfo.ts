// Contains only non-sensitive account info. Can be safely returned to the client.

export interface AccountInfo {
    id: number,
    email: string,
    name: string,
    profilePicture?: string
}