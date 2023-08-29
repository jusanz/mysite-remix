import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";

import { validateEmail, validatePassword, validateUrl } from "~/utils/validate";
import { db } from "~/utils/db.server";
import { register, createUserSession } from "~/utils/session.server";

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || "/");
  if (typeof email !== "string" || typeof password !== "string") {
    return json(
      {
        fieldErrors: null,
        fields: null,
        formError: "Form not submitted correctly",
      },
      { status: 400 }
    );
  }

  const fields = { password, email };
  const fieldErrors = {
    password: validatePassword(password),
    email: validateEmail(email),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return json({ fields, fieldErrors, formError: null }, { status: 400 });
  }

  const userExists = await db.user.findFirst({ where: { email } });
  if (userExists) {
    return json(
      {
        fields,
        fieldErrors: null,
        formError: `User with Email ${email} already exists`,
      },
      { status: 400 }
    );
  }

  const user = await register({ email, password });
  if (!user) {
    return json(
      {
        fields,
        fieldErrors: null,
        formError: "Something went wrong trying to create a new user.",
      },
      { status: 400 }
    );
  }
  return createUserSession(user.id, redirectTo);
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          to="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          JUSANZ
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" method="post">
              <input
                type="hidden"
                name="redirectTo"
                value={searchParams.get("redirectTo") ?? undefined}
              />
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required={true}
                  defaultValue={actionData?.fields?.email}
                  aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                  aria-errormessage={
                    actionData?.fieldErrors?.email ? "email-error" : undefined
                  }
                />
                {actionData?.fieldErrors?.email ? (
                  <p
                    className="form-validation-error"
                    role="alert"
                    id="email-error"
                  >
                    {actionData.fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required={true}
                  defaultValue={actionData?.fields?.password}
                  aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                  aria-errormessage={
                    actionData?.fieldErrors?.password
                      ? "password-error"
                      : undefined
                  }
                />
                {actionData?.fieldErrors?.password ? (
                  <p
                    className="form-validation-error"
                    role="alert"
                    id="password-error"
                  >
                    {actionData.fieldErrors.password}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
