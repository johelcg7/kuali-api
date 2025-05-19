import { LogsService } from '../services/logsService.js';

export const LogsController = {
  getAll: async (req, res) => {
    // Solo permitir acceso al admin
    if (!req.session.userEmail || req.session.userRole !== 'admin') { // Usar userRole para verificar admin
      return res.status(403).json({ error: 'Acceso denegado: solo el administrador puede ver los registros.' });
    }
    try {
      const logs = await LogsService.getAll();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Nueva función para eliminar un registro por ID
  deleteLog: async (req, res) => {
    // Solo permitir acceso al admin
    if (!req.session.userEmail || req.session.userRole !== 'admin') { // Usar userRole para verificar admin
      return res.status(403).json({ error: 'Acceso denegado: solo el administrador puede eliminar registros.' });
    }
    const { id } = req.params;
    try {
      const deletedLog = await LogsService.delete(parseInt(id));
      if (!deletedLog) {
        return res.status(404).json({ error: 'Registro no encontrado.' });
      }
      res.status(200).json({ message: 'Registro eliminado correctamente.', deletedLogId: deletedLog.id });
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      res.status(500).json({ error: 'Error al eliminar el registro.', details: error.message });
    }
  },
};
