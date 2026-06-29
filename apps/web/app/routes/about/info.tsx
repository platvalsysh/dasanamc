import { redirect } from "react-router";

export function loader() {
  return redirect("/", 301);
}

export default function AboutInfoRedirect() {
  return null;
}
