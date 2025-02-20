import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

dotenv.config();

const port = process.env.PORT || 8080;

const secret_key = process.env.SECRET_KEY;
// const secret_key = "";

app.listen(port, () => {
  console.log(`Corriendo app en puerto ${port}`);
});

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Servidor Nodemailer");
});

app.post("/mail", async (req, res) => {
  console.log(req.body);
  const { nombre, email, telefono, mensaje, captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ status: "error", mensaje: "Captcha token undefined" });
  }

  try {
    // Validar reCAPTCHA
    const { data } = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: secret_key,
        response: captcha,
      },
    });

    if (!data.success) {
      return res.status(400).json({ status: "error", mensaje: "Validación reCAPTCHA fallida" });
    }

    // Enviar correo
    await transport.sendMail({
      from: `"Antiguohobby" <${process.env.APP_USER}>`,
      to: "juampicalabro97@gmail.com",
      subject: "Solicitud cotización Antiguohobby",
      html: `
        <div>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Mensaje:</strong> ${mensaje}</p>
        </div>
      `,
    });

    return res.status(200).json({ status: "ok", mensaje: "Mensaje Enviado!" });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ status: "error", mensaje: "Error en el servidor, intenta más tarde." });
  }
});

