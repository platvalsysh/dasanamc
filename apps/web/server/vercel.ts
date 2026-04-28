import * as build from "virtual:react-router/server-build";
import { createRequestHandler, RouterContextProvider } from "react-router";
 
const handler = createRequestHandler(build);
export default async function (request: Request) : Promise<Response> {
  console.log("Vercel handler");
  let response = await handler(request, new RouterContextProvider());
  return response; 
}
