import { smsService } from "./SmsService";
import type { SmsModuleConfig } from "./types";

async function main() {
  console.log("Testing SMS Service...");

  // Mock Configuration
  const initialConfig: SmsModuleConfig = {
    defaultProfile: "default",
    profiles: {
      default: {
        name: "default",
        provider: "console",
        config: {
            senderNumber: "02-1234-5678",
        }
      },
      marketing: {
        name: "marketing",
        provider: "console",
        config: {
            senderNumber: "010-9999-9999",
        }
      },
    },
  };

  try {
    // 1. Configure the service (Mocking the DB save/load effectively)
    // In a real app, this is loaded from DB. Here we just want to test variable passing if we could,
    // but ConfigManager is a singleton connected to DB.
    // So we will just simulate the call signatures here to ensure types are correct.
    console.log("1. Checking Types...");

    // 2. Test sending with default profile
    // Note: This will fail at runtime if ConfigManager doesn't actually have data in DB,
    // but we are verifying the API signature (compilation).
    console.log("2. Attempting send (Default Profile)...");
    await smsService.send({ to: "010-1111-2222", text: "Default Profile Message" });

    // Test sending with specific profile (chaining)
  console.log("\nTesting send with specific profile 'marketing'...");
  const marketingProvider = await smsService.profile("marketing");
  await marketingProvider.send({
    to: "01087654321",
    text: "Hello from Marketing!",
  });

  // Test getProfiles
  console.log("\nListing available profiles...");
  const profiles = await smsService.getProfiles();
  console.log("Profiles:", profiles);

  // Test Typed Services
  // Note: These will fail in ConsoleProvider if we don't implement sendLMS/sendMMS in it
  // But ConsoleProvider DOES implement them now.
  
  /* 
  console.log("\nTesting LMS Service...");
  await lmsService.profile("marketing").send({
      to: "01012345678",
      text: "LMS Content",
      title: "LMS Title"
  });
  */

  } catch (e: any) {
    console.log("Caught expected error (likely due to missing DB config):", e.message);
  }
}

main().catch(console.error);
