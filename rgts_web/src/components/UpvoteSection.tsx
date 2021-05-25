import { Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import {
  PostsQuery,
  PostSnippetFragment,
  useVoteMutation,
  useMeQuery,
} from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}
export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] =
    useState<"upvote-loading" | "downvote-loading" | "not-loading">(
      "not-loading"
    );
  const [{data}] = useMeQuery()
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <IconButton
        variantColor= {post.voteStatus===1 ? "green" : undefined}
        icon="chevron-up"
        aria-label="Upvote Post"
        isDisabled={!data?.me}
        onClick={async () => {
          setLoadingState("upvote-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
      ></IconButton>
      {post.points}
      <IconButton
      variantColor= {post.voteStatus===-1 ? "red" : undefined}
        icon="chevron-down"
        aria-label="Downvote Post"
        isDisabled={!data?.me}
        onClick={async () => {
          setLoadingState("downvote-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
      ></IconButton>
    </Flex>
  );
};
