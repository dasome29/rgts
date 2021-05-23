import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { userInfo } from "os";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100) + "...";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    value = value !== -1 ? 1 : -1;
    const { userId } = req.session;
    const upvote = await Upvote.findOne({ where: { postId, userId } });

    if (upvote && upvote.value !== value) {
      await getConnection().transaction(async (tm) => {
        await tm.query(`
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3
          `, [value, postId, userId]);

          await tm.query(
            `
            update post
            set points = points + $1
            where id = $2
            `,
            [2* value, postId]
          );
      });
      
    } else if (!upvote) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into upvote ("userId", "postId", value)
          values($1, $2, $3)
          `,
          [userId, postId, value]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
          `,
          [value, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number, //Cursor-Based pagination
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() {req}: MyContext
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit) + 1;

    const replacements: any[] = [limit];

    const {userId} = req.session

    if (userId){
      replacements.push(userId);
    }
    let cursorIndex = 3

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndex = replacements.length
    }

    

    console.log("User ID: ",userId)
    


    const posts = await getConnection().query(
      `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
    ${userId ? 
      `(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"` 
    : `null as "voteStatus"`}
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, limit - 1),
      hasMore: posts.length === limit,
    };
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, {relations: ["creator"]});
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
