// Frontend version of backend user model

export default class User {
    constructor(username, email, profile_picture) {
        this.username = username;
        this.email = email;
        this.profile_picture = profile_picture;
    }
}
