// server/server.js
require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const path = require("path");

/* DB connection */
const { connectDB } = require("./config/db");

/* RAG Initialization */
const { initializeRAG } = require("./rag/ragInitializer");

/* ROUTES */
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json({ limit: "10mb" })); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true }));

/* Connect to DB */
connectDB();

/* Initialize RAG system with product embeddings */
setTimeout(() => {
  initializeRAG().catch(err => console.error("[RAG] Initialization error:", err));
}, 2000);

/* API Routes */
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);

/* Health check route */
app.get("/", (req, res) => {
  res.send("ElectroMart Backend Running Successfully 🚀");
});

/* Static file hosting (optional for production deploy) */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Start Server with port fallback if busy */
const net = require("net");

const PORT = parseInt(process.env.PORT, 10) || 5000;

function findAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve) => {
    let port = startPort;
    const tryPort = () => {
      const tester = net.createServer()
        .once('error', (err) => {
          tester.close();
          if (err.code === 'EADDRINUSE') {
            port += 1;
            if (port > startPort + maxAttempts) return resolve(null);
            tryPort();
          } else {
            return resolve(null);
          }
        })
        .once('listening', () => {
          tester.close();
          return resolve(port);
        })
        .listen(port, '0.0.0.0');
    };

    tryPort();
  });
}

(async () => {
  const available = await findAvailablePort(PORT);
  if (!available) {
    console.error(`Unable to find available port starting at ${PORT}`);
    process.exit(1);
  }

  app.listen(available, () => {
    console.log(`\n🚀 Server running on http://localhost:${available}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
})();
