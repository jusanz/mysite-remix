import { useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useEffect } from "react";

import { oauth, authorizationCode } from "~/utils/session.server";

export const loader = async () => {
  const { codeVerifier, codeChallenge, clientId } = authorizationCode();
  console.log(clientId);
  return redirect(
    `http://localhost:8000/o/authorize/?response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&client_id=${clientId}&redirect_uri=http://localhost:3000/`
  );
};

export default function Auth() {
  const data = useLoaderData<typeof loader>();
  useEffect(() => {
    console.log(data);
  }, []);
  return <div></div>;
}
