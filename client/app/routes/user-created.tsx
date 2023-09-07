import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

import { getUserInfo } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userInfo = await getUserInfo(request);
  return userInfo;
};

export default function UserCreated() {
  const data = useLoaderData<typeof loader>();
  useEffect(() => {
    console.log(data);
  }, []);
  return <div></div>;
}
