import { DefaultRead } from "./default/read";
import type { BoardSkinReadProps } from "../../public/read";

export function Read(props: BoardSkinReadProps) {
  const { loaderData, actionData, skin } = props;
  const childProps = { loaderData, actionData };
  
  switch (skin) {
    case "photo":
      return <DefaultRead {...childProps} />;
    case "faq":
      return <DefaultRead {...childProps} />;
    case "general":
    default:
      return <DefaultRead {...childProps} />;
  }
}
