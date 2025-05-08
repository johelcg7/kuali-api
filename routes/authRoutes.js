import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
<<<<<<< Updated upstream
=======
import session from 'express-session';
import cors from 'cors';
>>>>>>> Stashed changes

const router = express.Router();

<<<<<<< Updated upstream
=======
app.use(cors({
  origin: 'http://localhost:5173', // Permite solicitudes desde el frontend
}));

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

>>>>>>> Stashed changes
// Configurar la estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: '',
      clientSecret: '',
      callbackURL: '',
    },
    (accessToken, refreshToken, profile, done) => {
      // Aquí puedes guardar el usuario en la base de datos
      const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      };
      done(null, user);
    }
  )
);

// Serializar y deserializar usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Rutas de autenticación
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Manejo de errores en el callback de Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Redirigir al frontend después de iniciar sesión
    res.redirect('http://localhost:5173/leads');
  }
);

export default router;