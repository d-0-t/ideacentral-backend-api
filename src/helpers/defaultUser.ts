import User, { UserDocument } from "../models/User";

function randomPassword(): string {
  let x: string =
    (Math.random() + 1).toString(36).substring(2) +
    (Math.random() + 1).toString(36).substring(2) +
    (Math.random() + 1).toString(36).substring(2) +
    (Math.random() + 1).toString(36).substring(2) +
    (Math.random() + 1).toString(36).substring(2);
  return x;
}

export default function defaultUser(
  id: string,
  username: string
): UserDocument {
  let defaultUserConstruct = new User({
    login: {
      email: id,
      password: randomPassword(),
      username: username,
      admin: false,
      banned: false,
    },
    personal: {
      name: {
        firstName: "",
        lastName: "",
        public: true,
      },
      birthday: {
        date: "1000-01-01T00:00:00.000Z",
        public: true,
      },
      location: {
        country: {
          name: "",
          public: true,
        },
      },
      contacts: {
        email: {
          data: "",
          public: true,
        },
        phone: {
          data: "",
          public: true,
        },
        links: [],
      },
      avatar: "",
      bio: "",
    },
    interactions: {
      favorites: [],
      comments: [],
      upvotes: [],
      downvotes: [],
    },
    follow: {
      followers: {
        count: 0,
        users: [],
      },
      following: {
        count: 0,
        users: [],
      },
    },
    ideas: [],
    power: 0,
    messages: [],
  });
  return defaultUserConstruct;
}
