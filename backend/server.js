const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------
// 🔌 CONEXÃO MONGODB ATLAS
// -------------------------------
mongoose.connect(process.env.MONGODB_URI)

  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));


// -------------------------------
// 📌 MODEL (Schema)
// -------------------------------
const AtividadeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  data: { type: Date, default: Date.now }
});

const Atividade = mongoose.model("Atividade", AtividadeSchema);


// -------------------------------
// 📌 ROTAS API (CRUD COMPLETO)
// -------------------------------

// Criar
app.post("/atividades", async (req, res) => {
  try {
    const atividade = await Atividade.create(req.body);
    res.json(atividade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor online 🚀");
});

// Listar tudo
app.get("/atividades", async (req, res) => {
  try {
    const atividades = await Atividade.find().sort({ data: -1 });
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remover
app.delete("/atividades/:id", async (req, res) => {
  try {
    await Atividade.findByIdAndDelete(req.params.id);
    res.json({ message: "Atividade removida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar
app.put("/atividades/:id", async (req, res) => {
  try {
    const atividadeAtualizada = await Atividade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!atividadeAtualizada) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }

    res.json(atividadeAtualizada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// ▶️ INICIAR SERVIDOR
// -------------------------------
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
