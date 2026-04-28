import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

export const TableExtension = [
  Table.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            if (!attributes.style) return {};
            return { style: attributes.style };
          },
        },
      };
    },
  }).configure({
    resizable: true,
  }),
  TableRow,
  TableHeader.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            if (!attributes.style) return {};
            return { style: attributes.style };
          },
        },
      };
    },
  }),
  TableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            if (!attributes.style) return {};
            return { style: attributes.style };
          },
        },
      };
    },
  }),
];
