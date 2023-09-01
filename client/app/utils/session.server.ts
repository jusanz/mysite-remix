import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { db } from "./db.server";

type LoginForm = {
  password: string;
  email: string;
};

export async function register({ password, email }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
    },
  });
  return { id: user.id, username: user.name };
}

export async function login({ password, email }: LoginForm) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return null;
  }

  return { id: user.id, username: user.name };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("No session secret provided");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function makeid(length: number) {
  let result = "";
  //const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function authorizationCode() {
  const codeVerifier = btoa(makeid(getRandomInt(43, 128)));
  const codeChallenge = btoa(
    createHash("sha256").update(codeVerifier).digest("hex").toString()
  ).replace(/=/g, "");
  const clientId = process.env.DJANGO_CLIENT_ID;

  return { codeVerifier, codeChallenge, clientId };
}

export async function oauth() {
  return await fetch("http://django:8000/o/token/", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        process.env.DJANDGO_CLIENT_ID + ":" + process.env.DJANDGO_CLIENT_SECRET
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
    }),
  });
}
