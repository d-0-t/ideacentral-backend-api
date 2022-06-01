# **Idea Central - REST API**

[CLICK HERE FOR THE FRONTEND REPO & DEMO](https://github.com/d-0-t/ideacentral-frontend)

At Idea Central, after registering an user, the user has access to execute verious operations.  
Admin roles also exist, with operations that are only accessible to them.

This API will handle the requests of the Idea Central full stack project.  
It is deployed separately from the frontend.

## Technologies used

- **TypeScript** (JavaScript) - https://www.typescriptlang.org/
- **Node.js** - https://nodejs.org/en/
- **JWT** - JSON Web Tokens - https://jwt.io/
- **Passport** - for authentication - https://www.passportjs.org/
- **MongoDB** - NoSQL database - https://www.mongodb.com/
- **Mongoose** - object modeling for MongoDB & Node.js - https://mongoosejs.com/

---

## **ROUTES AND REQUESTS**

### **Base route: "/api/v1"**

---

### **Comments**

#### GET - Admin only

- **"/comments/all"**, auth, isUserAdmin
- **"/comments/:id"**, auth, isUserAdmin
- **"/comments/author/:userId"**, auth, isUserAdmin
- **"/comments/idea/:ideaId"**, auth, isUserAdmin

#### POST

- **"/comments/"**, auth, author only, creates new comment

#### PATCH

- **"/comments/:id"**, auth, author only, updates comment text

#### DELETE

- **"/comments/:id"**, - author or admin, deletes comment

---

### **Ideas**

#### GET

- **"/ideas/all"**, admins only, get all ideas
- **"/ideas/published"**, all users, get all published ideas (if anonymous, user is hidden)
- **"/ideas/:id"**, idea author or admin only if not published. If published, accessible by all non-restricted users.

#### POST

- **"/ideas/"**, create a new idea

#### DELETE

- **"/ideas/:id"**, author or admin, deletes idea

#### PATCH

- **"/ideas/:id"**, author only, update idea

##### **Interactions with the idea (requester must match)**

- Favorites
  - **"/ideas/:ideaId/fav/:userId"**, add idea to favorite
  - **"/ideas/:ideaId/unfav/:userId"**, remove favorite
- Upvotes
  - **"/ideas/:ideaId/upvote/:userId"**, upvote idea
  - **"/ideas/:ideaId/upvote-remove/:userId"**, remove upvote from idea
- Downvotes
  - **"/ideas/:ideaId/downvote/:userId"**, downvote idea
  - **"/ideas/:ideaId/downvote-remove/:userId"**, remove downvote from idea

---

### **Messages**

#### GET

- **"/messages/:id"**, admin only, for utility purposes, not in use

#### POST

- **"/messages/"**, requester must match sender, creates new message

#### PATCH

- Read / unread marker
  - **"/messages/:userId/read/:penpalId"**, mark as read message with penpal
  - **"/messages/:userId/unread/:penpalId"**, mark as unread message with penpal

#### PATCH

- **"/messages/:id/delete/:userId"**, special delete with patch, only removes from user. If it is removed from both users, the message gets actually deleted.
- **"/messages/:userId/deleteconversation/:penpalId"**, delete conversation, same behavior as deleted message

---

### **Reports**

#### POST

- **"/reports/"**, any user, create new report

**All the rest are admin-only operations!**

#### GET

- **"/reports/all"**, find all reports
- **"/reports/assigned/:assignedTo"**, find all reports assigned to an user (admin)
- **"/reports/ref/:ref"**, find all reports concerning a specific type (user, comment, message, idea)
- **"/reports/:id"**, find one report

#### PATCH

- **"/reports/:id"**, update one report
- **"/reports/:reportId/assign/:userId"**, assign report to an user (admin)

#### DELETE

- **"/reports/:id"**, delete a report (not recommended for archival)

---

### **Tags**

These are GET requests only, as **Tag** creation and deletion are handled by idea manipulation functions.

#### GET

- **"/tags/all"**, fetch all tags with all ideas
- **"/tags/published"**, fetch all tags, only contain published ideas
- **"/tags/:title/all"**, fetch all ideas with this tag title
- **"/tags/:title/published"**, fetch published ideas with this tag title

---

### **Users**

#### POST

- **"/users/"**, register (create) new user
- **"/users/login"**, log in with user

#### GET

- **"/users/all"**, auth, isUserAdmin, findAllUsers);
- **"/users/:id"**, all user info (except password) - for admins and profile owners
- **"/users/:id/public"**, only public info, for people who are logged in

#### PATCH

- **"/users/:id"**, matching user or admin can update user object
- Following (user interaction)
  - **"/users/:toFollow/follow/:theirFollower"**, follow someone
  - **"/users/:toUnfollow/unfollow/:theirUnfollower"**, unfollow someone
- **"/users/delete/:userId"**, special deletion - user info gets purged, username remains, user and the logged in functions become inaccessible

----
````
                       .,,uod8B8bou,,.
              ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
         ,=m8BBBBBBBBBBBBBBBRPFT?!||||||||||||||
         !...:!TVBBBRPFT||||||||||!!^^""'   ||||
         !.......:!?|||||!!^^""'            ||||
         !.........||||                     ||||
         !.........||||  ##                 ||||
         !.........||||                     ||||
         !.........||||                     ||||
         !.........||||                     ||||
         !.........||||                     ||||
         `.........||||                    ,||||
          .;.......||||               _.-!!|||||
   .,uodWBBBBb.....||||       _.-!!|||||||||!:'
!YBBBBBBBBBBBBBBb..!|||:..-!!|||||||!iof68BBBBBb....
!..YBBBBBBBBBBBBBBb!!||||||||!iof68BBBBBBRPFT?!::   `.
!....YBBBBBBBBBBBBBBbaaitf68BBBBBBRPFT?!:::::::::     `.
!......YBBBBBBBBBBBBBBBBBBBRPFT?!::::::;:!^"`;:::       `.
!........YBBBBBBBBBBRPFT?!::::::::::^''...::::::;         iBBbo.
`..........YBRPFT?!::::::::::::::::::::::::;iof68bo.      WBBBBbo.
  `..........:::::::::::::::::::::::;iof688888888888b.     `YBBBP^'
    `........::::::::::::::::;iof688888888888888888888b.     `
      `......:::::::::;iof688888888888888888888888888888b.
        `....:::;iof688888888888888888888888888888888899fT!
          `..::!8888888888888888888888888888888899fT|!^"'
            `' !!988888888888888888888888899fT|!^"'
                `!!8888888888888888899fT|!^"'
                  `!988888888899fT|!^"'
                    `!9899fT|!^"'
                      `!^"' 

ASCII Art Source: https://www.asciiart.eu/
````

---

# License

I'm lazy to look up the exact licensing code, but...

**Do not copy, modify, distribute, etc. without my written permission.**

**However, feel free to contact me about possible collaborations and offers.**

# Running the project

## Prerequisites

1. Install mongodb
2. Install nodejs

## Setting Up

1. Create a `.env` file in the root directory and copy the content from `.env.example`

2. Make sure mongodb is running
3. Install dependencies: `yarn`
4. Run `yarn build-ts`
5. Use this command for development mode: `yarn watch`

## Requirements

Below are the steps that you need to finish in order to finish this module

1. Explore the code base, start with `server.ts`
2. Create all the mongoose schema for your Project
3. Create CRUD endpoints for all the schema
4. Separate the routers and controller, controller goes into the controller folders. Controllers only handles request and response
5. For business logic like saving data to database, filtering, searching or updating, these are services and goes into services folder
6. Add authentication middleware using passport jwt strategy
