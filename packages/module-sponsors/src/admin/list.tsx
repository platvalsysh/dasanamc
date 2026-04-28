import { useLoaderData, Link } from "react-router";
import { prisma } from "@repo/database";
import { Button } from "@repo/ui-admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui-admin";

export async function loader() {
    const sponsors = await prisma.sponsors.findMany({
        orderBy: { created_at: "desc" },
    });
    return { sponsors };
}

export default function SponsorsList() {
    const { sponsors } = useLoaderData<typeof loader>();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    후원기업 관리
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({sponsors.length})
                    </span>
                </h1>
                <Button asChild>
                    <Link to="new">추가하기</Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px] text-center">No.</TableHead>
                            <TableHead>로고</TableHead>
                            <TableHead>사명</TableHead>
                            <TableHead>홈페이지</TableHead>
                            <TableHead>비고</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead className="text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sponsors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    등록된 후원기업이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                        {sponsors.map((sponsor, index) => (
                            <TableRow key={sponsor.id}>
                                <TableCell className="text-center font-medium text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    {sponsor.logo ? (
                                        <img src={sponsor.logo} alt={sponsor.name} className="h-10 w-auto object-contain" />
                                    ) : (
                                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Link to={`${sponsor.id}`} className="hover:underline font-medium">
                                        {sponsor.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {sponsor.url ? (
                                        <a href={sponsor.url} target="_blank" rel="noreferrer" className="underline text-blue-600">
                                            {sponsor.url}
                                        </a>
                                    ) : "-"}
                                </TableCell>
                                <TableCell>{sponsor.description || "-"}</TableCell>
                                <TableCell>{new Date(sponsor.created_at!).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link to={`${sponsor.id}`}>수정</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
