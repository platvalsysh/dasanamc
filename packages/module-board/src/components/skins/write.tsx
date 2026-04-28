import { DefaultWrite } from "./default/write";
import type { BoardSkinWriteProps } from "../../public/write";

export function Write(props: BoardSkinWriteProps) {
  const { loaderData, actionData, skin } = props;
  const childProps = { loaderData, actionData };
  switch (skin) {
    case "photo":
      return <DefaultWrite {...childProps} />;
    case "faq":
      return <DefaultWrite {...childProps} />;
    case "general":
    default:
      return <DefaultWrite {...childProps} />;
  }
}
