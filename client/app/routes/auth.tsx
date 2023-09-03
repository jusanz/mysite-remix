import type { LoaderArgs, LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { useEffect } from "react";

import { generateCodeChallenge, authorize } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);

  const codeChallenge = url.searchParams.get("codeChallenge");
  const clientId = url.searchParams.get("clientId");
  if (codeChallenge !== null && clientId !== null) {
    // get code from django
    return redirect(
      `http://localhost:8000/o/authorize/?response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&client_id=${clientId}&redirect_uri=http://localhost:3000/auth/`
    );
  }

  const code = url.searchParams.get("code");
  if (code !== null) {
    // authorize
    return authorize(request, code);
  }

  // generate code
  return generateCodeChallenge(request);
};

export default function Auth() {
  const data = useLoaderData<typeof loader>();
  useEffect(() => {
    console.log(data);
  }, []);
  return <div></div>;
}
