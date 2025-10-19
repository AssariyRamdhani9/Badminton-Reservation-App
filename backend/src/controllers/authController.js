const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key'; 


exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Semua field harus diisi.' });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create(name, email, passwordHash);
    console.log("DEBUG newUser:", newUser);

    const userId = newUser.id || newUser.user_id; 

    res.status(201).json({ 
      message: 'Pendaftaran berhasil!', 
      user: { id: userId, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findByEmail(email);
    console.log("DEBUG user from findByEmail:", user); 

    if (!user) {
      return res.status(400).json({ message: 'Kredensial tidak valid.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Kredensial tidak valid.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      message: 'Login berhasil!', 
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};