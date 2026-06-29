import { redirect } from "react-router";

export function loader() {
  return redirect("/support#contactform", 301);
}

export default function AboutContactRedirect() {
  return null;
}
