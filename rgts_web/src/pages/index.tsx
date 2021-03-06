import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "../generated/graphql";
import { Layout } from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/core";
import NextLink from "next/link";
import React, { useState } from "react";
import { UpvoteSection } from "../components/UpvoteSection";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
const Index = () => {
  const [{ data: meData, fetching: meFetching }] = useMeQuery({
    pause: isServer(),
  });
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [, deletePost] = useDeletePostMutation();
  const [, editPost] = useUpdatePostMutation();
  const [{ data, fetching , error}] = usePostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return (
      <div>
        <div>The query failed to pull Posts</div>
        <div>{error?.message}</div>
      </div>
    );
  }
  return (
    <Layout>
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p}></UpvoteSection>
                <Box ml={4} flex={1}>
                  <Flex>
                    <Box>
                      <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                        <Link fontSize="xl">{p.title}</Link>
                      </NextLink>
                      <Text ml="auto" fontSize={12}>
                        By {p.creator.username}
                      </Text>
                      <Text mt={4}>{p.textSnippet}</Text>
                    </Box>

                    <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            isLoading={fetching}
            m="auto"
            my={8}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
