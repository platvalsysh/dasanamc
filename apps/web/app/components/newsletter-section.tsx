import { LatestNewslettersWidget } from "@repo/module-newsletter";

interface NewsletterSectionProps {
    className?: string;
}

export function NewsletterSection({ className }: NewsletterSectionProps) {
    return (
        <LatestNewslettersWidget
            className={className}
        />
    );
}
