require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticator } = require('otplib');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Student = require('./models/Student');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Set OTP step to 30 seconds (default is 30, but explicitly defining it is good practice)
authenticator.options = { step: 30, window: 1 }; // window: 1 allows 1 step before/after (drift)

// Basic Socket connection logging
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Seed endpoint to create a test student
app.post('/api/students', async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const newStudent = new Student({
      usn: req.body.usn || '1AY25AI037',
      name: req.body.name || 'John Doe',
      totpSecret: secret,
      profilePhotoUrl: req.body.profilePhotoUrl || 'https://i.pravatar.cc/300?img=11'
    });

    await newStudent.save();
    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Verification endpoint
app.post('/api/verify', async (req, res) => {
  const { usn, token } = req.body;

  if (!usn || !token) {
    return res.status(400).json({ error: 'USN and token are required' });
  }

  try {
    const student = await Student.findOne({ usn });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const isValid = authenticator.verify({ token, secret: student.totpSecret });

    if (isValid) {
      // Emit success event to all connected clients (can be refined to specific rooms if needed)
      io.emit('scan_success', { usn: student.usn });
      
      return res.status(200).json({
        message: 'Verification successful',
        student: {
          name: student.name,
          profilePhotoUrl: student.profilePhotoUrl
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid or Expired Token' });
    }
  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start DB and Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  console.log('Connected to In-Memory MongoDB');

  // Create a default user so we don't have to hit the seed endpoint manually every time
  const defaultSecret = 'JBSWY3DPEHPK3PXP'; // A static base32 secret for predictable testing if needed
  // Alternatively, just generate a new one
  const secret = authenticator.generateSecret();
  const defaultStudent = new Student({
    usn: '1AY25AI037',
    name: 'Neo Matrix',
    totpSecret: secret,
    profilePhotoUrl: 'https://i.pravatar.cc/300?img=60'
  });
  await defaultStudent.save();
  console.log(`Default Student Created:
  USN: ${defaultStudent.usn}
  Secret: ${defaultStudent.totpSecret}`);

  server.listen(PORT, () => {
    console.log(`Backend API server running on http://localhost:${PORT}`);
  });
}

startServer();
