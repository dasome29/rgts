import { Box, Button, Flex, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import {
  useLogoutMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}
export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer()
  });

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
      <Flex>
        <Box mr={3}>{data.me.username}</Box>
        <Button
          variant="link"
          color="black"
          isLoading={logoutFetching}
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
