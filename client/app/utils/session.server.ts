import { createCookieSessionStorage, redirect, json } from "@remix-run/node";
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

export async function generateCodeChallenge(request: Request) {
  const crypto = require("crypto");

  const session = await getUserSession(request);

  //const codeVerifier = ;
  const codeVerifier = btoa(makeid(getRandomInt(43, 128)));
  const codeChallenge = btoa(
    crypto.createHash("sha256").update(codeVerifier).digest()
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const clientId = process.env.DJANGO_CLIENT_ID;
  if (typeof clientId !== "string") {
    throw new Error("No client id provided");
  }

  const searchParams = new URLSearchParams({
    codeChallenge,
    clientId,
  });

  session.set("codeVerifier", codeVerifier);
  return redirect(`/auth?${searchParams}`, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function authorize(request: Request, code: string) {
  const session = await getUserSession(request);
  const codeVerifier = session.get("codeVerifier");
  if (!codeVerifier || typeof codeVerifier !== "string") {
    throw new Error("No code verifier provided");
  }
  const clientId = process.env.DJANGO_CLIENT_ID;
  const clientSecret = process.env.DJANGO_CLIENT_SECRET;
  if (typeof clientId !== "string" || typeof clientSecret !== "string") {
    throw new Error("No client id or secret provided");
  }
  const response = await fetch("http://django:8000/o/token/", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      redirect_uri: "http://localhost:3000/auth/",
      grant_type: "authorization_code",
    }).toString(),
  });
  const json: {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token: string;
  } = await response.json();

  // get user_id from django

  // get or create user
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const user = await db.user.create({
      data: {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
      },
    });
    session.set("userId", user.id);
    return redirect("/user-created", {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }
  throw { message: "User already exists" };
}

export const getUserInfo = async (request: Request) => {
  const user = await db.user.findUnique({
    where: { id: await getUserId(request) },
  });

  const response = await fetch("http://django:8000/users/", {
    method: "GET",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${user.access_token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  const json = await response.json();
  return json;
};
