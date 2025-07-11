import fs from "fs";
import path from "path";

const urlRegex =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

const dirPath = "/data";
const filePath = path.join(dirPath, "links.json");

if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");

const links = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const response = links[url.pathname];
      return new Response(response, { status: response ? 200 : 404, headers });
    }

    if (req.method === "POST") {
      const body = await req.json();
      body.url = body.url.trim().toLowerCase();
      body.title = body.title.trim().toLowerCase();

      if (body.key !== process.env.SECRET_KEY)
        return new Response("Invalid Key", { status: 401, headers });

      if (
        typeof body.url !== "string" ||
        body.url.length === 0 ||
        !urlRegex.test(body.url)
      )
        return new Response("Invalid URL", { status: 400, headers });

      if (typeof body.title !== "string" || body.title.length === 0)
        return new Response("Invalid Title", { status: 400, headers });

      links["/" + body.title] = body.url;
      fs.writeFileSync(filePath, JSON.stringify(links));

      return new Response("", { status: 200, headers });
    }

    if (req.method === "OPTIONS") {
      return new Response("", {
        status: 200,
        headers,
      });
    }
  },
});

console.log("Server is running on port 3000");
