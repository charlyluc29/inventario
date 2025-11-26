const express = require('express');
const cors = requiere('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(cors());

// --- CONEXIÓN A MONGODB ATLAS ---
mongoose.connect('mongodb+srv://admin:root@cluster0.erza3jx.mongodb.net/inventario?retryWrites=true&w=majority')
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.log("❌ Error al conectar a MongoDB:", err));

// --- MODELOS ---
// Contador para IDs secuenciales
const CounterSchema = new mongoose.Schema({
  name: String,
  seq: Number
});
const Counter = mongoose.model('Counter', CounterSchema);

// Producto con ID secuencial
const ProductoSchema = new mongoose.Schema({
  id: Number, // ID secuencial
  nombre: String,
  descripcion: String,
  cantidad: Number
});
const Producto = mongoose.model("Producto", ProductoSchema);

// --- RUTAS ---
// Obtener todos los productos (oculta _id y __v)
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find({}, { _id: 0, __v: 0 });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un producto por ID secuencial
app.get('/api/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({ id: req.params.id }, { _id: 0, __v: 0 });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo producto con ID secuencial
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, descripcion, cantidad } = req.body;

    // Obtener el contador de productos
    let counter = await Counter.findOne({ name: 'productos' });
    if (!counter) {
      counter = new Counter({ name: 'productos', seq: 0 });
      await counter.save();
    }

    counter.seq += 1;
    await counter.save();

    const nuevo = new Producto({
      id: counter.seq,
      nombre,
      descripcion,
      cantidad
    });

    await nuevo.save();
    
    // Enviar solo campos visibles
    const { _id, __v, ...productoVisible } = nuevo.toObject();
    res.status(201).json(productoVisible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar producto por ID secuencial
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { nombre, descripcion, cantidad } = req.body;
    const producto = await Producto.findOneAndUpdate(
      { id: req.params.id },
      { nombre, descripcion, cantidad },
      { new: true }
    );
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const { _id, __v, ...productoVisible } = producto.toObject();
    res.json(productoVisible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto por ID secuencial
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findOneAndDelete({ id: req.params.id });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ mensaje: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
