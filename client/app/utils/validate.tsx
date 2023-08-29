export function validateEmail(email: string) {
  if (!email.includes("@")) {
    return "Please enter a valid email address";
  }
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
}

export function validateUrl(url: string) {
  const urls = ["/"];
  if (urls.includes(url)) {
    return url;
  }
  return "/";
}
