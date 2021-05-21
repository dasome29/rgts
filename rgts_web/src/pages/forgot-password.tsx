import { Box, Button, Divider, Flex, Link } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import router from "next/router";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";
import NextLink from "next/link";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          const response = await forgotPassword(values);
          setComplete(true);
          //   if (response.data?.forgotPassword.errors) {
          //     setErrors(toErrorMap(response.data.login.errors));
          //   } else if (response.data?.login.user) {
          //     // Means that it worked, here you will redirect the page to another one
          //     console.log(response.data.login.user);
          //     router.push("/");
          //     console.log("Pushed");
          //   }
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If there is an account with that email, we sent you an email.
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              />
              <Box mt={4}>
                <InputField name="password" label="Password" type="password" />
              </Box>
              <Flex mt={2}>
                <NextLink href="/forgot-password">
                  <Link ml="auto">Forgot password?</Link>
                </NextLink>
              </Flex>
              <Button
                type="submit"
                mt={4}
                isLoading={isSubmitting}
                variantColor="teal"
              >
                Login
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
