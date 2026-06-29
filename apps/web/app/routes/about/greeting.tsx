import { redirect } from "react-router";

export function loader() {
  return redirect("/about", 301);
}

export default function AboutGreetingRedirect() {
  return null;
}
