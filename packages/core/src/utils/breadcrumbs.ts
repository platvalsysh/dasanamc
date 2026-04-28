import type { AdminMenuConfigItem, SiteMenuConfigItem } from "../types";

export interface Breadcrumb {
  label: string;
  path: string;
  isCurrent: boolean;
}

type MenuItem = AdminMenuConfigItem | SiteMenuConfigItem;

/**
 * Generate breadcrumbs by traversing the menu tree to find the current path.
 * 
 * @param menuItems The menu structure to search within.
 * @param currentPath The current URL path to match.
 * @returns Array of Breadcrumb objects representing the path to the current item.
 */
export function getBreadcrumbs(
  menuItems: MenuItem[],
  currentPath: string
): Breadcrumb[] {
  // Normalize path by removing trailing slash if not root
  const normalizedPath = currentPath.length > 1 && currentPath.endsWith('/') 
    ? currentPath.slice(0, -1) 
    : currentPath;

  const result: Breadcrumb[] = [];

  // Helper to get path/to from item safely
  const getPath = (item: MenuItem): string | undefined => {
      if ('path' in item) return item.path;
      if ('to' in item) return item.to;
      return undefined;
  };

  const getChildren = (item: MenuItem): MenuItem[] | undefined => {
      // TypeScript union handling might need assertion or check
      return item.children; 
  };

  // Helper to traverse and find path
  function findPath(items: MenuItem[], parents: MenuItem[]): boolean {
    for (const item of items) {
      // Recursive check children first to prefer deeper matches
      const children = getChildren(item);
      if (children && children.length > 0) {
        if (findPath(children, [...parents, item])) {
          return true;
        }
      }

      const itemPath = getPath(item); 
      if (itemPath === normalizedPath) {
        // Found it!
        // Add all parents + current
        [...parents, item].forEach((p, index, arr) => {
            result.push({
                label: p.label,
                path: getPath(p) || "#", 
                isCurrent: index === arr.length - 1
            });
        });
        return true;
      }
    }
    return false;
  }

  // First pass: Try to find exact match in the tree
  const found = findPath(menuItems, []);

  if (!found) {
      // Logic: Iterate all items, find the one with the longest matching prefix path
      const searchState: {
        bestMatch: { item: MenuItem; parents: MenuItem[]; matchLength: number } | null
      } = { bestMatch: null };
      
      function findBestPrefix(items: MenuItem[], parents: MenuItem[]) {
          for (const item of items) {
              const itemPath = getPath(item);
              if (itemPath && normalizedPath.startsWith(itemPath)) {
                  // Ensure we match whole segments (so /board/Not doesn't match /board/Notice)
                  // basically item.path should be followed by / or end or string
                  const validSegment = 
                    normalizedPath === itemPath || 
                    normalizedPath[itemPath.length] === '/';
                  
                  if (validSegment) {
                      // Prefer longer match, or same length but deeper (more parents)
                      if (!searchState.bestMatch || 
                          itemPath.length > searchState.bestMatch.matchLength ||
                          (itemPath.length === searchState.bestMatch.matchLength && parents.length > searchState.bestMatch.parents.length)
                      ) {
                          searchState.bestMatch = { item, parents, matchLength: itemPath.length };
                      }
                  }
              }
              
              const children = getChildren(item);
              if (children) {
                  findBestPrefix(children, [...parents, item]);
              }
          }
      }
      
      findBestPrefix(menuItems, []);
      
      if (searchState.bestMatch) {
           const match = searchState.bestMatch;
           [...match.parents, match.item].forEach((p, index, arr) => {
            result.push({
                label: p.label,
                path: getPath(p) || "#",
                isCurrent: false // Since we only matched prefix, user is "deeper" than menu
            });
        });
      }
  }

  return result;
}
