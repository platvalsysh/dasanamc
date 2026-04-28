"use strict";

import { createRequestHandler } from "@react-router/express";
import express from "express";
import getPort from "get-port";
import morgan from "morgan";
import os from "node:os";
import cors from 'cors';

/**
 * 
 * @param {string=} raw 
 * @returns 
 */
function parseNumber(raw) {
  if (raw === undefined) return undefined;
  const maybe = Number(raw);
  if (Number.isNaN(maybe)) return undefined;
  return maybe;
}

async function run() {
  const isProduction = process.env.NODE_ENV === "production";
  const isDev = !isProduction;
  let port = 3000
  if (isDev) {
    port = parseNumber(process.env.PORT) ?? (await getPort({ port: 5175 }));
  }

  const onListen = () => {
    const host = process.env.HOST;

    if (host) {
      if (host === "0.0.0.0") {
        const localAddress =
          Object.values(os.networkInterfaces())
            .flat()
            .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
            ?.address;
        console.log(
          `[react-router-serve] http://localhost:${port} (http://${localAddress}:${port}) (http://${host}:${port})`,
        );
      } else {
        console.log(
          `[react-router-serve] http://localhost:${port} (http://${host}:${port})`,
        );
      }
    } else {
      console.log(`[react-router-serve] http://localhost:${port}`);
    }
  };

  const app = express();
  app.disable("x-powered-by");
  app.set('trust proxy', true);

  // app.use((req, res, next) => {
  //   console.log(req.ip);
  //   console.log(req.ips);
  //   next();
  // });

  app.use(cors());

  app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.sendStatus(404);
  });

  if (isProduction) {
    app.use(express.static("build/client", { maxAge: "1h" }));
    app.use(
      createRequestHandler({
        build: await import("./build/server/index.js"),
      }),
    );

  } else {
    const viteDevServer = await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

    app.use(morgan("tiny"));
    app.use(viteDevServer.middlewares);
    app.use(
      createRequestHandler({
        build: () =>
          viteDevServer.ssrLoadModule(
            "virtual:react-router/server-build",
          ),
      }),
    );
  }

  const server = process.env.HOST
    ? app.listen(port, process.env.HOST, onListen)
    : app.listen(port, '127.0.0.1', onListen);

  ["SIGTERM", "SIGINT"].forEach((signal) => {
    process.once(signal, () => server?.close(console.error));
  });
}

run();
