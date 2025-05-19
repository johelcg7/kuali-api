import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { logAction } from '../services/logAction.js';
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
        // Primero buscar el usuario
        let existingUser = await prisma.users.findUnique({
          where: {
            email: profile.emails[0].value,
          },
        });

        let user;
        if (existingUser) {
          // Si el usuario existe, actualiza solo googleId y nombre
          user = await prisma.users.update({
            where: {
              email: profile.emails[0].value,
            },
            data: {
              googleId: profile.id,
              name: profile.displayName,
            },
          });
        } else {
          // Si el usuario no existe, créalo con rol 'user'
          user = await prisma.users.create({
            data: {
              email: profile.emails[0].value,
              googleId: profile.id,
              name: profile.displayName,
              role: 'user',
              unique_code: Math.random().toString(36).substring(7),
            },
          });
        }
        
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
  async (req, res) => {
    try {
      // Establecer la cookie de sesión explícitamente
      req.session.userId = req.user.id;
      req.session.userEmail = req.user.email;
      req.session.userRole = req.user.role;

      // Solo registrar login para usuarios no administradores
      if (req.user.role !== 'admin') {
        await logAction({
          userId: req.user.id,
          action: 'user_login',
          details: {
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            loginType: 'google',
            ip: req.ip
          }
        });
      }

      // Guardar la sesión
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Redirigir con los datos del usuario como parámetros de consulta
      const userDataParams = new URLSearchParams({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }).toString();
      res.redirect(`http://localhost:5004/login?${userDataParams}`);
    } catch (error) {
      console.error('Error en el callback de Google:', error);
      res.redirect('http://localhost:5004/login');
    }
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

    // Crear nuevo usuario siempre con rol 'user'
    const newUser = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        unique_code: Math.random().toString(36).substring(7),
      },
    });

    // Establecer la sesión
    req.session.userId = newUser.id;
    req.session.userEmail = newUser.email;
    req.session.userRole = newUser.role;

    // Guardar la sesión de forma asíncrona
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Registrar acción de registro (siempre se registra ya que será un usuario normal)
    await logAction({
      userId: newUser.id,
      action: 'user_register',
      details: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        ip: req.ip
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

router.get('/status', async (req, res) => {
  if (req.session.userId) {
    try {
      // Obtener datos completos del usuario desde la base de datos
      const user = await prisma.users.findUnique({
        where: { id: req.session.userId }
      });
      
      res.json({ 
        isAuthenticated: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      res.status(500).json({ error: 'Error al obtener los datos del usuario' });
    }
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