const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// --- CONEXIÓN A MONGODB ATLAS ---
mongoose.connect('mongodb+srv://admin:root@cluster0.erza3jx.mongodb.net/inventario?retryWrites=true&w=majority')
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.log("❌ Error al conectar a MongoDB:", err));

// --- MODELO DE PRODUCTO ---
const ProductoSchema = new mongoose.Schema({
  nombre: String,
  cantidad: Number
});

const Producto = mongoose.model("Producto", ProductoSchema);

// --- RUTAS DE LA API ---
app.get('/api/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

app.get('/api/productos/:id', async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(producto);
});

app.post('/api/productos', async (req, res) => {
  const { nombre, cantidad } = req.body;
  const nuevo = new Producto({ nombre, cantidad });
  await nuevo.save();
  res.status(201).json(nuevo);
});

app.put('/api/productos/:id', async (req, res) => {
  const { nombre, cantidad } = req.body;
  const producto = await Producto.findByIdAndUpdate(
    req.params.id,
    { nombre, cantidad },
    { new: true }
  );
  res.json(producto);
});

app.delete('/api/productos/:id', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Producto eliminado" });
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
