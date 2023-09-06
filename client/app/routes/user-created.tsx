import type { LoaderArgs } from "@remix-run/node";

import { getUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  getUserId(request);
};

export default function UserCreated() {
  return <div></div>;
}
