const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinics');
const patientRoutes = require('./routes/patients');
const turnsRoutes = require('./routes/turns');
const db = require('./utils/db');
const { verifySocketToken } = require('./utils/jwt');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reasignacion', require('./routes/reasignacion'));
app.use('/api/turns', turnsRoutes);

// simple health
app.get('/', (req, res) => res.send({ ok: true }));

// socket middleware: token optional for display, required for authenticated panels
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();
  try {
    const user = verifySocketToken(token);
    socket.user = user;
    next();
  } catch (err) {
    // allow anonymous (displays) to connect without token
    next();
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id, 'user=', socket.user?.username || 'anon');

  socket.on('joinClinic', (clinicId) => {
    socket.join(`clinic_${clinicId}`);
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected', socket.id);
  });
});

// attach io to app so routes/controllers can emit
app.set('io', io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  try {
    await db.connect();
    console.log('Connected to DB');
  } catch (err) {
    console.error('DB connection failed', err.message);
  }
  console.log(`Server listening on port ${PORT}`);
});
