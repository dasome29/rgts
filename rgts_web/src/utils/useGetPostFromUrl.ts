import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl = () => {
    const router = useRouter();
  const intId: number =
    typeof router.query.id === "string"
      ? (parseInt(router.query.id) as number)
      : -1;
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
}