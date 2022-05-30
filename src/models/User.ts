/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from "mongoose";
export type LinkType = {
  title: string;
  url: string;
  public: boolean;
};

export type UserDocument = Document & {
  login: {
    username: string;
    email: string;
    password: string;
    admin: boolean;
    banned: boolean;
    reports: string[];
  };
  personal: {
    avatar: string;
    name: {
      firstName: string;
      lastName: string;
      public: boolean;
    };
    birthday: {
      date: Date;
      public: boolean;
    };
    location: {
      country: {
        name: string;
        public: boolean;
      };
    };
    bio: string;
    contacts: {
      email: {
        data: string;
        public: boolean;
      };
      phone: {
        data: string;
        public: boolean;
      };
      links: LinkType[];
    };
  };
  ideas: string[];
  interactions: {
    favorites: string[];
    comments: string[];
    upvotes: string[];
    downvotes: string[];
  };
  messages: {
    penpal: string;
    messages: string[];
    read: boolean;
  }[];
  power: number;
  follow: {
    followers: {
      count: number;
      users: string[];
    };
    following: {
      count: number;
      users: string[];
    };
  };
};

const userSchema = new mongoose.Schema(
  {
    login: {
      username: { type: String, unique: true, required: true },
      email: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      admin: { type: Boolean, default: false },
      banned: { type: Boolean, default: false },
      reports: [{ type: mongoose.Types.ObjectId, ref: "Report" }],
    },
    personal: {
      avatar: { type: String, default: "" },
      name: {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        public: { type: Boolean, default: true },
      },
      birthday: {
        date: { type: Date, default: new Date("1000") },
        public: { type: Boolean, default: true },
      },
      location: {
        country: {
          name: { type: String, default: "" },
          public: { type: Boolean, default: true },
        },
      },
      bio: { type: String, default: "" },
      contacts: {
        email: {
          data: { type: String, default: "" },
          public: { type: Boolean, default: true },
        },
        phone: {
          data: { type: String, default: "" },
          public: { type: Boolean, default: true },
        },
        links: [
          {
            _id: false,
            title: { type: String },
            url: { type: String },
            public: { type: Boolean, default: true },
          },
        ],
      },
    },
    ideas: [{ type: mongoose.Types.ObjectId, ref: "Idea" }],
    interactions: {
      favorites: [{ type: mongoose.Types.ObjectId, ref: "Idea" }],
      comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
      upvotes: [{ type: mongoose.Types.ObjectId, ref: "Idea" }],
      downvotes: [{ type: mongoose.Types.ObjectId, ref: "Idea" }],
    },
    messages: [
      {
        penpal: { type: mongoose.Types.ObjectId, ref: "User" },
        messages: [{ type: mongoose.Types.ObjectId, ref: "Message" }],
        read: { type: Boolean, default: false },
      },
    ],
    power: { type: Number, default: 0 },
    follow: {
      followers: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
      following: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", userSchema);
