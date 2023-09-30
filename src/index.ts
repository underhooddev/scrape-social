import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {
  convertInstagramReelsToDdInstagram,
  convertTwitterUrl,
  getElementFromHTML,
} from "./libs/utils";
import { generateRequestId } from "./libs/requestId";

const app = new Elysia()

  .group("/v1", (app) => {
    return app
      .post("/reels/", async (context) => {
        try {
          const body = await context.request.json();
          const urlParam = body.url;
          if (urlParam == null) return;
          const convertedUrl = convertInstagramReelsToDdInstagram(urlParam);

          const response = await fetch(convertedUrl, {
            redirect: "follow",
            headers: {
              "user-agent":
                "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            },
          });
          if (response.ok) {
            const htmlRaw = await response.text();
            const finalres = getElementFromHTML(htmlRaw, response.url);
            // The response.url property will contain the final redirected URL
            // const newRes = await fetch(finalres!.url, { redirect: "follow" });
            const id = generateRequestId();
            return new Response(
              JSON.stringify({
                id: id,
                message: finalres!.url,
                error: "",
                type: finalres!.type,
                service: "instagram",
                code: "P200",
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            throw new Error("Request failed with status " + response.status);
          }
        } catch (err: any) {
          console.log(err);
          return new Response(
            JSON.stringify({
              message: "Can't fetch reels. Server Error",
              error: err.message,
              code: "P404",
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
              status: 501,
            }
          );
        }
      })
      .post("/tweets/", async (context) => {
        try {
          const body = await context.request.json();
          const urlParam = body.url;
          if (urlParam == null) return;

          const convertedUrl = convertTwitterUrl(urlParam);

          const id = generateRequestId();
          return new Response(
            JSON.stringify({
              id: id,
              message: convertedUrl,
              error: "",
              type: "custom",
              service: "twitter",
              code: "P200",
            })
          ); // Respond with success
        } catch (err: any) {
          console.log(err);
          return new Response(
            JSON.stringify({
              message: "Can't fetch tweet. Server Error",
              error: err.message,
              code: "P04",
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
              status: 501,
            }
          );
        }
      });
  })
  .get("/", () => "Running Nicely!!")

  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
