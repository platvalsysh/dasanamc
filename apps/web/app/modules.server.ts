import { module as auth } from "@repo/auth/module";
import { module as admin } from "@repo/admin/module";
import { module as board } from "@repo/module-board/module";
import { module as bxmember } from "@repo/module-bxmember/module";
import { module as file } from "@repo/module-file/module";
import { module as core } from "@repo/core/module";
import { module as sms } from "@repo/module-sms/module";
import { module as sponsors } from "@repo/module-sponsors/module";
import { module as organization } from "@repo/module-organization/module";
import { module as newsletter } from "@repo/module-newsletter/module";
import { module as schedule } from "@repo/module-schedule/module";

// Export all modules
export const modules = [
  core,
  auth,
  admin,
  board,
  bxmember,
  file,
  sms,
  sponsors,
  organization,
  newsletter,
  schedule,
];
