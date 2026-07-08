// Linked to Accounts table in the database
export type Account = {
    id: number;
    status: boolean,
    email: string,
    name: string,
    password: string
    profilePicture?: string
};

// Carries non sensitive account info: can be sent to other people safely
export type AccountInfo = {
    id: number;
    name: string;
    profilePicture?: string
};

// Carries account profile info: used on Edit Profile page
export type AccountProfile = {
    id: number;
    email: string;
    name: string;
    profilePicture?: string
};
