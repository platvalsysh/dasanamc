import { type ActionFunctionArgs } from "react-router";
import { getSmsFailoverConfig, setSmsFailoverConfig } from "../../../.server/config";

export async function action({ request, context }: ActionFunctionArgs) {

  if (request.method === "GET") {
    const config = await getSmsFailoverConfig();
    return Response.json({ success: true, config });
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const configData = formData.get("config") as string;
    
    if (!configData) {
      return Response.json({ success: false, error: "Config data is required" }, { status: 400 });
    }

    try {
      const config = JSON.parse(configData);
      await setSmsFailoverConfig(config);
      return Response.json({ success: true });
    } catch (e: any) {
      return Response.json({ success: false, error: e.message }, { status: 400 });
    }
  }

  return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
}

// React Router 7+ 에서는 loader도 action과 동일하게 처리 가능하지만, 
// 명시적으로 구분하기 위해 loader 추가
export async function loader(args: ActionFunctionArgs) {
  return action(args);
}
