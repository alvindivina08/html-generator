import express, { Request, Response, NextFunction } from "express";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { Resend } from "resend";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);
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
  "/send-email",
  apiKeyMiddleware,
  async (req: Request, res: Response) => {
    const { document } = req.body;
    try {
      const html = renderToStaticMarkup(document, { rootBlockId: "root" });
      await resend.emails.send({
        from: "Web Store <hello@alvindivina.com>",
        to: "alvindivina08@gmail.com",
        subject: "Thanks for your order! This is your receipt.",
        html: html,
      });
      res.status(200).send({ message: "Email sent successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to send email." });
    }
  }
);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
