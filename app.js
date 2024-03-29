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
    res
      .status(400)
      .json({ status: "error", mensaje: "Captcha token undefined" });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captcha}`;

  axios({
    url: verifyUrl,
    method: "POST",
  }).then(({ data }) => {
    // console.log(data.success);
    if (data.success) {
      try {
        let result = transport.sendMail({
          from: `"Antiguohobby" <${process.env.APP_USER}>`,
          to: "juampicalabro97@gmail.com",
          subject: "Solicitud cotizacion Antiguohobby",
          html: `
        <div>
            <p> Nombre: ${nombre}</p>
            <p> Email: ${email}</p>
            <p> Telefono: ${telefono}</p>
            <p> Mensaje: ${mensaje}</p>
        </div>
        `,
          attachments: [],
        });
        res.status(200).json({ status: "ok", mensaje: 'Mensaje Enviado!' });
      } catch (error) {
        res.status(400).json({ status: "error", mensaje: 'Error al enviar el mensaje. Intenta nuevamente mas tarde.' });
      }
    } else {
      return res.json({
        status: "error",
        mensaje: "Debes ser un robot",
      });
    }
  });
});
