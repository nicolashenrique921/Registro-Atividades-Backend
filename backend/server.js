const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// -------------------------------
// ⚙️ MIDDLEWARES
// -------------------------------
app.use(cors());
app.use(express.json());

// -------------------------------
// 🔌 CONEXÃO MONGODB ATLAS
// -------------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => {
    console.error("Erro ao conectar MongoDB:", err);
    process.exit(1);
  });

// -------------------------------
// 📌 MODEL
// -------------------------------
const AtividadeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: String,
  data: { type: Date, default: Date.now }
});

// 🔁 transforma _id em id automaticamente
AtividadeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Atividade = mongoose.model("Atividade", AtividadeSchema);

// -------------------------------
// 📌 ROTAS
// -------------------------------

app.get("/", (_, res) => {
  res.send("Servidor online 🚀");
});

// -------------------------------
// ➕ CRIAR
// -------------------------------
app.post("/atividades", async (req, res) => {
  try {
    const atividade = await Atividade.create(req.body);
    res.status(201).json(atividade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// 📄 LISTAR (PAGINAÇÃO + BUSCA)
// -------------------------------
app.get("/atividades", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const titulo = req.query.titulo || "";

    const filtro = titulo
      ? { titulo: { $regex: titulo, $options: "i" } }
      : {};

    const total = await Atividade.countDocuments(filtro);

    const atividades = await Atividade.find(filtro)
      .sort({ data: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: atividades,
      total,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// 🔍 BUSCAR POR ID
// -------------------------------
app.get("/atividades/:id", async (req, res) => {
  try {
    const atividade = await Atividade.findById(req.params.id);

    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    res.json(atividade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// ✏️ ATUALIZAR
// -------------------------------
app.put("/atividades/:id", async (req, res) => {
  try {
    const atividade = await Atividade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!atividade) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }

    res.json(atividade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------
// 🗑️ REMOVER
// -------------------------------
app.delete("/atividades/:id", async (req, res) => {
  try {
    const atividade = await Atividade.findByIdAndDelete(req.params.id);

    if (!atividade) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }

    res.json({ message: "Atividade removida" });
  } catch (err) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// -------------------------------
// ▶️ START SERVER
// -------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
