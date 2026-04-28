import { prisma } from "@repo/database";

export const OrganizationService = {
    // Groups
    getGroups: async () => {
        return prisma.organization_groups.findMany({
            orderBy: { order: "asc" },
            include: {
                organization_positions: {
                    orderBy: { order: "asc" },
                },
            },
        });
    },

    createGroup: async (data: { name: string; description?: string }) => {
        const maxOrder = await prisma.organization_groups.findFirst({
            orderBy: { order: "desc" },
        });
        return prisma.organization_groups.create({
            data: {
                ...data,
                order: (maxOrder?.order ?? 0) + 1,
                updated_at: new Date(),
            },
        });
    },

    updateGroup: async (id: string, data: { name?: string; description?: string; order?: number }) => {
        return prisma.organization_groups.update({
            where: { id },
            data,
        });
    },

    moveGroup: async (id: string, direction: "up" | "down") => {
        const groups = await prisma.organization_groups.findMany({ orderBy: { order: "asc" } });
        const currentIndex = groups.findIndex((g) => g.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex >= 0 && targetIndex < groups.length) {
            const currentItem = groups[currentIndex];
            const targetItem = groups[targetIndex];
            await prisma.$transaction([
                prisma.organization_groups.update({ where: { id: currentItem.id }, data: { order: targetItem.order } }),
                prisma.organization_groups.update({ where: { id: targetItem.id }, data: { order: currentItem.order } }),
            ]);
        }
    },

    deleteGroup: async (id: string) => {
        return prisma.organization_groups.delete({
            where: { id },
        });
    },

    // Positions
    createPosition: async (data: { name: string; description?: string; groupId: string }) => {
        const maxOrder = await prisma.organization_positions.findFirst({
            where: { group_id: data.groupId },
            orderBy: { order: "desc" },
        });
        return prisma.organization_positions.create({
            data: {
                name: data.name,
                description: data.description,
                group_id: data.groupId,
                order: (maxOrder?.order ?? 0) + 1,
                updated_at: new Date(),
            },
        });
    },

    updatePosition: async (id: string, data: { name?: string; description?: string; order?: number }) => {
        return prisma.organization_positions.update({
            where: { id },
            data,
        });
    },

    movePosition: async (id: string, groupId: string, direction: "up" | "down") => {
        const positions = await prisma.organization_positions.findMany({
            where: { group_id: groupId },
            orderBy: { order: "asc" },
        });
        const currentIndex = positions.findIndex((p) => p.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex >= 0 && targetIndex < positions.length) {
            const currentItem = positions[currentIndex];
            const targetItem = positions[targetIndex];
            await prisma.$transaction([
                prisma.organization_positions.update({ where: { id: currentItem.id }, data: { order: targetItem.order } }),
                prisma.organization_positions.update({ where: { id: targetItem.id }, data: { order: currentItem.order } }),
            ]);
        }
    },

    deletePosition: async (id: string) => {
        return prisma.organization_positions.delete({
            where: { id },
        });
    },

    // Members
    getMembers: async () => {
        return prisma.organization_members.findMany({
            where: { is_active: true },
            orderBy: [
                { organization_groups: { order: "asc" } },
                { organization_positions: { order: "asc" } },
                { order: "asc" },
            ],
            include: {
                organization_groups: true,
                organization_positions: true,
                bxmember: true,
            },
        });
    },

    createMember: async (data: {
        name: string;
        major?: string;
        gisu?: string;
        groupId: string;
        positionId: string;
        memberId?: number;
    }) => {
        const maxOrder = await prisma.organization_members.findFirst({
            where: { position_id: data.positionId },
            orderBy: { order: "desc" },
        });

        return prisma.organization_members.create({
            data: {
                name: data.name,
                major: data.major,
                gisu: data.gisu,
                group_id: data.groupId,
                position_id: data.positionId,
                member_id: data.memberId,
                order: (maxOrder?.order ?? 0) + 1,
                updated_at: new Date(),
            },
        });
    },

    updateMember: async (
        id: string,
        data: {
            name?: string;
            major?: string;
            gisu?: string;
            positionId?: string;
            memberId?: number;
            order?: number;
            is_active?: boolean;
        }
    ) => {
        return prisma.organization_members.update({
            where: { id },
            data: {
                name: data.name,
                major: data.major,
                gisu: data.gisu,
                position_id: data.positionId,
                member_id: data.memberId,
                order: data.order,
                is_active: data.is_active,
            },
        });
    },

    moveMember: async (id: string, positionId: string, direction: "up" | "down") => {
        const members = await prisma.organization_members.findMany({
            where: { position_id: positionId, is_active: true },
            orderBy: { order: "asc" },
        });
        const currentIndex = members.findIndex((m) => m.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex >= 0 && targetIndex < members.length) {
            const currentItem = members[currentIndex];
            const targetItem = members[targetIndex];
            await prisma.$transaction([
                prisma.organization_members.update({ where: { id: currentItem.id }, data: { order: targetItem.order } }),
                prisma.organization_members.update({ where: { id: targetItem.id }, data: { order: currentItem.order } }),
            ]);
        }
    },

    deleteMember: async (id: string) => {
        return prisma.organization_members.delete({
            where: { id },
        });
    },

    // Search BXMember
    searchBxMember: async (query: string) => {
        if (!query || query.length < 2) return [];
        return prisma.bxmember.findMany({
            where: {
                OR: [{ name_kor: { contains: query } }],
            },
            take: 10,
        });
    },
};
