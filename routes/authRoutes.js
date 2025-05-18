import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
dotenv.config();

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:5004',
  credentials: true,
}));

router.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3003/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await prisma.users.upsert({
          where: {
            email: profile.emails[0].value,
          },
          update: {
            googleId: profile.id,
            name: profile.displayName,
          },
          create: {
            email: profile.emails[0].value,
            googleId: profile.id,
            name: profile.displayName,
            unique_code: Math.random().toString(36).substring(7),
          },
        });
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: true,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5004/login',
    failureMessage: true,
  }),
  (req, res) => {
    // Establecer la cookie de sesión explícitamente
    req.session.userId = req.user.id;
    req.session.userEmail = req.user.email;
    req.session.userRole = req.user.role;
    
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.redirect('http://localhost:5004/login');
      }
      res.redirect('http://localhost:5004/');
    });
  }
);

// Ruta para registro manual
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        unique_code: Math.random().toString(36).substring(7),
      },
    });

    // Establecer la sesión
    req.session.userId = newUser.id;
    req.session.userEmail = newUser.email;

    // Guardar la sesión antes de responder
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.status(500).json({ error: 'Error al iniciar sesión después del registro' });
      }

      // Enviar respuesta exitosa
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

router.get('/status', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      isAuthenticated: true, 
      user: {
        id: req.session.userId,
        email: req.session.userEmail
      } 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

export default router;