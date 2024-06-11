import express, { Request, Response, NextFunction } from "express";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { VercelRequest, VercelResponse } from "@vercel/node";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.SEND_EMAIL_API_KEY) {
    next();
  } else {
    res.status(403).send({ message: "Forbidden: Invalid API Key" });
  }
};

app.post(
  "/generate-html",
  apiKeyMiddleware,
  async (req: Request, res: Response) => {
    const { document } = req.body;
    try {
      const html = renderToStaticMarkup(document, { rootBlockId: "root" });
      res.status(200).send({ html });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to generate HTML." });
    }
  }
);

export default (req: VercelRequest, res: VercelResponse) => app(req, res);
