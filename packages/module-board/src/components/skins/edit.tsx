import { DefaultEdit } from "./default/edit";
import type { BoardSkinEditProps } from "../../public/edit";

export function Edit(props: BoardSkinEditProps) {
  const { loaderData, actionData, skin } = props;
  const childProps = { loaderData, actionData };
  switch (skin) {
    case "photo":
      return <DefaultEdit {...childProps} />;
    case "faq":
      return <DefaultEdit {...childProps} />;
    case "general":
    default:
      return <DefaultEdit {...childProps} />;
  }
}
