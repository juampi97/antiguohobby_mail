import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

dotenv.config();

const port = process.env.PORT || 8080;

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
    rejectUnauthorized: false
}
});


app.get("/", (req, res) => {
  res.send("Servidor Nodemailer");
});

app.post("/mail", async (req, res) => {
  console.log(req.body)
  const {nombre, email, telefono, mensaje} = req.body
  try {
    let result = await transport.sendMail({
      from: `"Prueba" <${process.env.APP_USER}>`,
      to: "juampicalabro97@gmail.com",
      subject: "Correo de prueba",
      html: `
        <div>
            <h3> Nombre: ${nombre}</h3>
            <h3> Email: ${email}</h3>
            <h3> Telefono: ${telefono}</h3>
            <h3> Mensaje: ${mensaje}</h3>
        </div>
        `,
      attachments: [],
    });
    res.status(200).json({ status: "ok", mensaje: result });
  } catch (error) {
    res.status(400).json({ status: "error", mensaje: error });
  }
});
