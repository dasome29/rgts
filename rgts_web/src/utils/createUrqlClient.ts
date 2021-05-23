import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { useRouter } from "next/router";
import gql from "graphql-tag";

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("Not Authenticated")) {
          useRouter().replace("/login");
        }
      })
    );
  };

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:8000/graphql",
  fetchOptions: { credentials: "include" as const },
  // Updates the cache when login and registring
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (_result, args, cache, info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            if (data) {
              if (data.voteStatus === value) {
                return;
              }
              const newPoints =
                (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value }
              );
            }
          },

          createPost: (_result, args, cache, info) => {
            const allFields = cache.inspectFields("Query");
            const fieldInfos = allFields.filter(
              (info) => info.fieldName === "posts"
            );

            fieldInfos.forEach((fi) => {
              cache.invalidate("Query", "posts", fi.arguments || {});
            });
          },

          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                }
                return {
                  me: result.login.user,
                };
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                }
                return {
                  me: result.register.user,
                };
              }
            );
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInTheCache = cache.resolve(entityKey, fieldKey);
    info.partial = !isInTheCache;
    const results: string[] = [];
    let hasMore = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      if (!cache.resolve(key, "hasMore")) {
        hasMore = false;
      }
      results.push(...data);
    });
    return { __typename: "PaginatedPosts", posts: results, hasMore: hasMore };
  };
};
