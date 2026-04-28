-- CreateTable
CREATE TABLE "modules"."organization_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules"."organization_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "group_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules"."organization_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "major" VARCHAR(255),
    "gisu" VARCHAR(255),
    "group_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "member_id" INTEGER, 
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "modules"."organization_positions" ADD CONSTRAINT "organization_positions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "modules"."organization_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules"."organization_members" ADD CONSTRAINT "organization_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "modules"."organization_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules"."organization_members" ADD CONSTRAINT "organization_members_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "modules"."organization_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules"."organization_members" ADD CONSTRAINT "organization_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "modules"."bxmember"("seq") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "organization_positions_group_id_idx" ON "modules"."organization_positions"("group_id");

-- CreateIndex
CREATE INDEX "organization_members_group_id_idx" ON "modules"."organization_members"("group_id");

-- CreateIndex
CREATE INDEX "organization_members_position_id_idx" ON "modules"."organization_members"("position_id");

-- CreateIndex
CREATE INDEX "organization_members_member_id_idx" ON "modules"."organization_members"("member_id");
