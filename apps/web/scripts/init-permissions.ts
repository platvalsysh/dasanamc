import { prisma } from "@repo/database";
import {
  admin_permissions,
  admin_roles,
  admin_role_permissions,
} from "@repo/auth/types";

async function main() {
  console.log("🚀 Starting permissions initialization...\n");

  try {
    // 1. Insert permissions
    console.log("📝 Inserting permissions...");
    for (const permission of admin_permissions) {
      await prisma.admin_permissions.upsert({
        where: { id: permission.id },
        update: {
          name: permission.name,
          display_name: permission.display_name,
          description: permission.description,
          category: permission.category,
          is_dangerous: permission.is_dangerous,
        },
        create: {
          id: permission.id,
          name: permission.name,
          display_name: permission.display_name,
          description: permission.description ?? null,
          category: permission.category,
          is_dangerous: permission.is_dangerous,
        },
      });
    }
    console.log(`✅ Inserted ${admin_permissions.length} permissions\n`);

    // 2. Insert roles
    console.log("👥 Inserting roles...");
    for (const role of admin_roles) {
      await prisma.admin_roles.upsert({
        where: { id: role.id },
        update: {
          name: role.name,
          display_name: role.display_name,
          description: role.description,
          level: role.level,
          is_active: role.is_active,
          updated_at: new Date(),
        },
        create: {
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          description: role.description ?? null,
          level: role.level,
          is_active: role.is_active,
          created_at: new Date(role.created_at),
          updated_at: new Date(role.updated_at),
        },
      });
    }
    console.log(`✅ Inserted ${admin_roles.length} roles\n`);

    // 3. Insert role-permission mappings
    console.log("🔗 Inserting role-permission mappings...");
    let mappingCount = 0;

    for (const [roleName, permissionNames] of Object.entries(
      admin_role_permissions,
    )) {
      const role = admin_roles.find((r) => r.name === roleName);
      if (!role) {
        console.warn(`⚠️  Role not found: ${roleName}`);
        continue;
      }

      for (const permissionName of permissionNames) {
        const permission = admin_permissions.find(
          (p) => p.name === permissionName,
        );
        if (!permission) {
          console.warn(`⚠️  Permission not found: ${permissionName}`);
          continue;
        }

        await prisma.admin_role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: permission.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });
        mappingCount++;
      }
    }
    console.log(`✅ Inserted ${mappingCount} role-permission mappings\n`);

    console.log("🎉 Permissions initialization completed successfully!");
  } catch (error) {
    console.error("❌ Error during initialization:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
