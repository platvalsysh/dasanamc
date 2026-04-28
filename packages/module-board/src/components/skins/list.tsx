import { DefaultList as GeneralList } from "./default/list";
import { FaqList } from "./faq/list";
import { PhotoList } from "./photo/list";
import type { BoardSkinListProps } from "../../public/list";

export function List(props: BoardSkinListProps) {
  const { loaderData, actionData, skin } = props;
  const childProps = { loaderData, actionData };
  switch (skin) {
    case "photo":
      return <PhotoList {...childProps} />;
    case "faq":
      return <FaqList {...childProps} />;
    case "general":
    default:
      return <GeneralList {...childProps} />;
  }
}
