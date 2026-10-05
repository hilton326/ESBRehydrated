**ESB Rehydrated** is a websocket based chat application based on the deprecated chat feature of Encyclopedia SpongeBobia, where I met some friends who I still talk to today. Said feature was removed in a Fandom update that rolled out in 2019-20. Years later, with some software engineering knowledge, I decided to recreate the old chat's old functionality and design with modern tools. 

* **Frontend**: Vite with JavaScript + React.js
* **Backend**: Express.js with TypeScript (Socket.io for websocket connections)
* **Database**: PostgreSQL

**Current features:**
* A registration and authentication system using HTTP only cookies (revisions in progress)
* A main chatroom where you can message everyone who is currently logged in at the same time
* Message history; old messages are re-loaded from the database when someone joins
* UI/UX designed to be nearly 1:1 with the old experience, but with the reliability of modern tools
* Custom profile pictures and usernames, with the ability to change them at any time

**More features planned for the first release:**
* Separate chat rooms where you can message a subset of people in the main chat
* Email verification for security against bots
* Downloading message history
* Different colors and fonts in message text
* Emojis and multimedia messages

**WIP. First release expected later this year.**
