import { redirect } from "react-router";

export function loader() {
  return redirect("/centers#checkup", 301);
}

export default function CheckupRedirect() {
  return null;
}
