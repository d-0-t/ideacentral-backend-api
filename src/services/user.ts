import User, { UserDocument } from "../models/User";

async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const user = await User.findOne({ "login.email": email });
  return user;
}
async function findUserByUsername(
  username: string
): Promise<UserDocument | null> {
  const user = await User.findOne({ "login.username": username });
  return user;
}

async function createUser(User: UserDocument): Promise<UserDocument> {
  return User.save();
}

async function findAllUsers(): Promise<UserDocument[]> {
  return User.find().select("login.username");
}

async function findOneUserUnpopulated(
  id: string
): Promise<UserDocument | null> {
  return User.findById(id);
}
async function findOneUser(id: string): Promise<UserDocument | null> {
  return User.findById(id)
    .select("-login.password")
    .populate({ path: "ideas comments" })
    .populate({
      path: "interactions.favorites",
      match: {
        $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
      },
    })
    .populate({
      path: "interactions.upvotes",
      match: {
        $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
      },
    })
    .populate({
      path: "interactions.downvotes",
      match: {
        $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
      },
    })
    .populate({ path: "interactions.comments" })
    .populate({ path: "follow.followers.users", select: "login.username" })
    .populate({ path: "follow.following.users", select: "login.username" })
    .populate({ path: "messages.penpal", select: "login.username" })
    .populate({ path: "messages.messages" });
}
async function findOneUserPublic(id: string): Promise<UserDocument | null> {
  let user = User.findById(id)
    .select(
      "login.username personal follow.followers.count follow.following.count ideas power"
    )
    .populate({
      path: "ideas",
      match: {
        $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
      },
      select:
        "title description tags stats.upvotes.count stats.downvotes.count stats.favorites.count",
    });
  return user;
}

async function findFullUser(id: string): Promise<UserDocument | null> {
  return User.findById(id);
}

async function updateUser(
  id: string,
  newInfo: any
): Promise<UserDocument | null> {
  return await User.findByIdAndUpdate(id, newInfo, { new: true }).select(
    "-login.password"
  );
}

async function deleteUser(id: string): Promise<UserDocument | null> {
  const foundUser = User.findByIdAndDelete(id).select("-login.password");
  return foundUser;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addReportToUser(
  userId: string,
  reportId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "login.reports": reportId,
      },
    },
    { new: true }
  ).select("_id login.reports");
  return user;
}
async function removeReportFromUser(
  userId: string,
  reportId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "login.reports": reportId,
      },
    },
    { new: true }
  ).select("_id login.reports");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addIdeaToUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        ideas: ideaId,
      },
    },
    { new: true }
  ).select("_id ideas");
  return user;
}

async function removeIdeaFromUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        ideas: ideaId,
      },
    },
    { new: true }
  ).select("_id ideas");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addFavoriteIdeaToUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "interactions.favorites": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.favorites power");
  return user;
}
async function removeFavoriteIdeaFromUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "interactions.favorites": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.favorites power");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function powerUpdate(
  userId: string,
  powerChange: number
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        power: powerChange,
      },
    },
    { new: true }
  ).select("_id power");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addUpvoteToUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "interactions.upvotes": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.upvotes power");
  return user;
}
async function removeUpvoteFromUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "interactions.upvotes": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.upvotes power");
  return user;
}

async function addDownvoteToUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "interactions.downvotes": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.downvotes power");
  return user;
}
async function removeDownvoteFromUser(
  userId: string,
  ideaId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "interactions.downvotes": ideaId,
      },
    },
    { new: true }
  ).select("_id interactions.downvotes power");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addCommentToUser(
  userId: string,
  commentId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "interactions.comments": commentId,
      },
    },
    { new: true }
  ).select("_id interactions.comments");
  return user;
}

async function removeCommentFromUser(
  userId: string,
  commentId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "interactions.comments": commentId,
      },
    },
    { new: true }
  ).select("_id interactions.comments");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addFollower(
  userId: string,
  followerId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "follow.followers.users": followerId,
      },
      $inc: {
        "follow.followers.count": 1,
      },
    },
    { new: true }
  ).select("_id follow.followers");
  return user;
}

async function removeFollower(
  userId: string,
  followerId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "follow.followers.users": followerId,
      },
      $inc: {
        "follow.followers.count": -1,
      },
    },
    { new: true }
  ).select("_id follow.followers");
  return user;
}

async function addFollowing(
  userId: string,
  followingId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        "follow.following.users": followingId,
      },
      $inc: {
        "follow.following.count": 1,
      },
    },
    { new: true }
  ).select("_id follow.following");
  return user;
}

async function removeFollowing(
  userId: string,
  followingId: string
): Promise<UserDocument | null> {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        "follow.following.users": followingId,
      },
      $inc: {
        "follow.following.count": -1,
      },
    },
    { new: true }
  ).select("_id follow.following");
  return user;
}

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

export default {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findAllUsers,
  findOneUserUnpopulated,
  findOneUser,
  findOneUserPublic,
  findFullUser,
  updateUser,
  deleteUser,
  addReportToUser,
  removeReportFromUser,
  addIdeaToUser,
  removeIdeaFromUser,
  addFavoriteIdeaToUser,
  removeFavoriteIdeaFromUser,
  powerUpdate,
  addUpvoteToUser,
  removeUpvoteFromUser,
  addDownvoteToUser,
  removeDownvoteFromUser,
  addCommentToUser,
  removeCommentFromUser,
  addFollower,
  removeFollower,
  addFollowing,
  removeFollowing,
};
