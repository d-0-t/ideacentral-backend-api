import Tag, { TagDocument } from "../models/Tag";

async function findTagByTitle(title: string): Promise<TagDocument | null> {
  const tag = await Tag.findOne({ title }).populate({ path: "ideas" });
  return tag;
}

async function findAllTags(): Promise<TagDocument[]> {
  return Tag.find().populate({ path: "ideas" });
}

async function findTagByTitleWithPublishedIdeas(
  title: string
): Promise<TagDocument | null> {
  const tag = await Tag.findOne({ title }).populate({
    path: "ideas",
    match: {
      $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
    },
    select:
      "title description tags stats.upvotes.count stats.downvotes.count stats.favorites.count",
  });
  return tag;
}

async function findAllTagsWithPublishedIdeas(): Promise<TagDocument[]> {
  return Tag.find().populate({
    path: "ideas",
    match: {
      $and: [{ published: { $eq: true } }, { anonymous: { $eq: false } }],
    },
    select:
      "title description tags stats.upvotes.count stats.downvotes.count stats.favorites.count",
  });
}

async function createTag(Tag: TagDocument): Promise<TagDocument> {
  return Tag.save();
}

async function updateTag(
  title: string,
  count: number
): Promise<TagDocument | null> {
  return Tag.findOneAndUpdate(
    { title },
    { $inc: { count: count } },
    { new: true }
  );
}

async function addIdeaToTag(
  title: string,
  ideaId: string
): Promise<TagDocument | null> {
  return Tag.findOneAndUpdate(
    { title },
    { $push: { ideas: ideaId } },
    { new: true }
  );
}

async function removeIdeaFromTag(
  title: string,
  ideaId: string
): Promise<TagDocument | null> {
  return Tag.findOneAndUpdate(
    { title },
    { $pull: { ideas: ideaId } },
    { new: true }
  );
}

async function deleteTag(title: string): Promise<TagDocument | null> {
  const tag = await Tag.findOneAndDelete({ title });
  return tag;
}

async function deleteTagById(id: string): Promise<TagDocument | null> {
  const tag = await Tag.findByIdAndDelete(id);
  return tag;
}

export default {
  createTag,
  findAllTags,
  findTagByTitle,
  findTagByTitleWithPublishedIdeas,
  findAllTagsWithPublishedIdeas,
  updateTag,
  addIdeaToTag,
  removeIdeaFromTag,
  deleteTag,
  deleteTagById,
};
