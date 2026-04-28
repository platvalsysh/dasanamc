import { type LoaderFunctionArgs } from "react-router";
import { prisma } from "@repo/database";
import { convert } from "html-to-text";
import type { BoardWidgetItem, BoardWidgetResponse } from "../types/widget";

export async function loader({ request }: LoaderFunctionArgs): Promise<BoardWidgetResponse> {
  const url = new URL(request.url);
  const midsParam = url.searchParams.get("mids");

  if (!midsParam) {
    return { items: [] };
  }

  const mids = midsParam.split(",").map(s => s.trim()).filter(Boolean);

  if (mids.length === 0) {
    return { items: [] };
  }

  // Fetch data for each mid in parallel
  const results = await Promise.all(
    mids.map(async (mid): Promise<BoardWidgetItem | null> => {
      const module = await prisma.modules.findFirst({
        where: { mid: { equals: mid, mode: "insensitive" } },
      });

      if (!module) return null;

      // Assuming 'title' or 'browser_title' exists on module. 
      // Checking types might be needed, but usually 'title' is valid for UI.
      // If schema uses something else, I'll default to mid.
      // Common schema: id, mid, browser_title, ...
      // I'll try to select browser_title if available, or just use what I have.
      // Based on previous view, I didn't see the full module type, but usually it's there.
      // I'll use 'browser_title' if it exists in the schema, otherwise 'mid'.
      // Let's assume 'browser_title' is the user-facing name.
      
      const document = await prisma.documents.findFirst({
        where: {
          module_id: module.id,
          status: "PUBLIC",
        },
        orderBy: { created_at: "desc" },
        include: {
          document_categories: true,
        },
      });

      return {
        mid: module.mid,
        moduleTitle: (module as any).browser_title || module.mid, // Safe fallback
        document: document ? {
          id: document.id,
          title: document.title,
          date: document.created_at ? document.created_at.toISOString() : "",
          summary: convert(document.content || "", {
              wordwrap: false,
              selectors: [{ selector: 'img', format: 'skip' }, { selector: 'a', options: { ignoreHref: true } }]
          }).substring(0, 500), // increased limit slightly, removed "..."
          category: document.document_categories?.name || undefined,
        } : undefined
      };
    })
  );

  const items = results
    .filter((item): item is BoardWidgetItem => item !== null)
    .sort((a, b) => {
      const dateA = a.document?.date || "";
      const dateB = b.document?.date || "";
      return dateB.localeCompare(dateA); 
    });

  return { items };
}
