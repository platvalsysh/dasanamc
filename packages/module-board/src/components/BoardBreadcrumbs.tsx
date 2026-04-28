import { Link, useLocation } from "react-router";
import { getBreadcrumbs } from "@repo/core/utils";
import { useSiteMenu } from "@repo/core/ui";


export function BoardBreadcrumbs() {
    const location = useLocation();
    const { menuItems } = useSiteMenu();
    const breadcrumbs = getBreadcrumbs(menuItems, location.pathname);

    if (breadcrumbs.length == 0) {
        return <></>
    }

    return (
        <div className="text-sm text-gray-500">
            <Link to="/" className="hover:underline">HOME</Link>
            {
                breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        &nbsp;&gt;&nbsp;
                        <Link
                            to={crumb.path}
                            className={`${crumb.isCurrent ? "font-bold text-[#555]" : "text-[#888] hover:underline"}`}
                        >
                            {crumb.label}
                        </Link>
                    </span>
                ))
            }
        </div>
    );
}
