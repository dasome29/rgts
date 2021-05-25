import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import {
  useLogoutMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}
export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  const router = useRouter();

  let body = null;
  // Data is loading
  if (fetching) {
    body = null;
  } // User not logged in
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } //User is logged in
  else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button mr={4} as={Link} backgroundColor="lightgrey">
            Create Post
          </Button>
        </NextLink>

        <Box mr={3}>{data.me.username}</Box>
        <Button
          variant="link"
          color="black"
          isLoading={logoutFetching}
          onClick={async () => {
            await logout();
            router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex m="auto" maxW={800} flex={1}>
        <NextLink href="/">
          <Link>
            <Heading>RGTS</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
