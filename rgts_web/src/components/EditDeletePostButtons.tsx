import { Flex, IconButton, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number
}
export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId
}) => {
  const [, deletePost] = useDeletePostMutation();
  const [{data}] = useMeQuery()
  if (data?.me?.id !== creatorId){
      return null
  }
  return (
    <Flex ml="auto" direction="column" align="center">
      <IconButton
        icon="delete"
        backgroundColor="transparent"
        aria-label="Delete Post"
        onClick={() => {
          deletePost({ id: id });
        }}
      ></IconButton>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          icon="edit"
          backgroundColor="transparent"
          aria-label="Edit Post"
          as={Link}
        ></IconButton>
      </NextLink>
    </Flex>
  );
};
