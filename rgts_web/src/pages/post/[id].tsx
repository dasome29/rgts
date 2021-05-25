import { Box, Flex, Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

interface PostProps {}
const Post: React.FC<PostProps> = ({}) => {
  const [{ data, fetching }] = useGetPostFromUrl();
  const router = useRouter()

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div>could not find post</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Flex>
        <Box>
      <Heading>{data.post.title}</Heading>
      {data.post.text}
      </Box>
      <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id}/>
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
