const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec); // Convierte exec a una promesa

// --- Ubicaciones de archivos y directorios ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');
const BACKUP_METADATA_FILE = path.join(DATA_DIR, 'backups.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'backup-settings.json');

// --- Funciones de Utilidad (sin cambios) ---
const ensureFilesAndDirs = async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    try { await fs.access(BACKUP_METADATA_FILE); } catch { await fs.writeFile(BACKUP_METADATA_FILE, JSON.stringify([])); }
    try { await fs.access(SETTINGS_FILE); } catch { await fs.writeFile(SETTINGS_FILE, JSON.stringify({ autoBackupEnabled: true, backupFrequency: 'Diario' })); }
};
const readBackups = async () => JSON.parse(await fs.readFile(BACKUP_METADATA_FILE, 'utf-8'));
const writeBackups = async (backups) => await fs.writeFile(BACKUP_METADATA_FILE, JSON.stringify(backups, null, 2));

// --- (El resto del archivo no necesita cambios) ---

// --- Controladores ---

// GET /api/respaldos
exports.getBackups = async (req, res) => {
    await ensureFilesAndDirs();
    const backups = await readBackups();
    res.json(backups);
};

// POST /api/respaldos (Crear respaldo manual)
exports.createBackup = async (req, res) => {
    await ensureFilesAndDirs();
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupId = `BKP-MANUAL-${timestamp}`;
    const backupFileName = `${backupId}.sql`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    const newBackupMetadata = {
        id: backupId,
        date: now.toISOString(),
        type: 'Manual',
        status: 'EN PROGRESO',
        size: 'N/A',
        initiatedBy: req.user.correo,
        fileName: backupFileName,
    };

    try {
        const backups = await readBackups();
        backups.unshift(newBackupMetadata);
        await writeBackups(backups);

        res.status(202).json({ message: 'Respaldo iniciado.', backup: newBackupMetadata });

        // --- Proceso de respaldo asíncrono con mysqldump ---
        const { DB_DATABASE, DB_USER, DB_PASSWORD, DB_HOST } = process.env;
        const dumpCommand = `mysqldump --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} ${DB_DATABASE} > "${backupFilePath}"`;

        await execPromise(dumpCommand);
        
        const stats = await fs.stat(backupFilePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        // Actualizar metadatos a "COMPLETADO"
        const finalBackups = await readBackups();
        const backupToUpdate = finalBackups.find(b => b.id === backupId);
        if (backupToUpdate) {
            backupToUpdate.status = 'COMPLETADO';
            backupToUpdate.size = `${sizeInMB} MB`;
            await writeBackups(finalBackups);
        }
        console.log(`Respaldo ${backupId} completado exitosamente.`);

    } catch (error) {
        console.error('Error al crear el respaldo con mysqldump:', error);
        // Marcar como fallido si algo sale mal
        const finalBackups = await readBackups();
        const backupToUpdate = finalBackups.find(b => b.id === backupId);
        if (backupToUpdate) {
            backupToUpdate.status = 'FALLIDO';
            await writeBackups(finalBackups);
        }
    }
};

// DELETE /api/respaldos/:id
exports.deleteBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToDelete = backups.find(b => b.id === id);

    if (!backupToDelete) {
        return res.status(404).json({ message: 'Respaldo no encontrado.' });
    }

    try {
        // Eliminar el archivo físico
        const filePath = path.join(BACKUPS_DIR, backupToDelete.fileName);
        await fs.unlink(filePath);

        // Eliminar la entrada de los metadatos
        const updatedBackups = backups.filter(b => b.id !== id);
        await writeBackups(updatedBackups);

        res.status(200).json({ message: `Respaldo ${id} eliminado.` });
    } catch (error) {
        console.error(`Error al eliminar el respaldo ${id}:`, error);
        res.status(500).json({ message: 'Error al eliminar el archivo de respaldo.' });
    }
};

// GET /api/respaldos/:id/download
exports.downloadBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToDownload = backups.find(b => b.id === id);

    if (!backupToDownload || backupToDownload.status !== 'COMPLETADO') {
        return res.status(404).json({ message: 'Respaldo no disponible para descarga.' });
    }

    const filePath = path.join(BACKUPS_DIR, backupToDownload.fileName);
    res.download(filePath, backupToDownload.fileName, (err) => {
        if (err) {
            console.error("Error al descargar el archivo:", err);
            res.status(500).send("No se pudo descargar el archivo.");
        }
    });
};

// POST /api/respaldos/:id/restore
exports.restoreBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToRestore = backups.find(b => b.id === id);

    if (!backupToRestore || backupToRestore.status !== 'COMPLETADO') {
        return res.status(400).json({ message: 'Respaldo no válido para restauración.' });
    }
    
    const backupFilePath = path.join(BACKUPS_DIR, backupToRestore.fileName);

    try {
        // --- Proceso de restauración con mysql ---

        // CORRECCIÓN: Usar los nombres exactos de tu archivo .env
        const { DB_DATABASE, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

        // CORRECCIÓN: Construir el comando con las variables correctas
        const restoreCommand = `mysql --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} ${DB_DATABASE} < "${backupFilePath}"`;

        await execPromise(restoreCommand);
        res.status(200).json({ message: `Restauración desde ${id} completada. Se recomienda reiniciar el servidor.` });
    } catch (error) {
        console.error(`Error al restaurar desde ${id}:`, error);
        res.status(500).json({ message: 'Ocurrió un error durante la restauración.' });
    }
};

// --- Controladores de Configuración ---

// GET /api/settings/respaldos
exports.getBackupSettings = async (req, res) => {
    await ensureFilesAndDirs();
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8');
    res.json(JSON.parse(settingsData));
};

// POST /api/settings/respaldos
exports.saveBackupSettings = async (req, res) => {
    const { autoBackupEnabled, backupFrequency } = req.body;
    if (typeof autoBackupEnabled !== 'boolean' || !['Diario', 'Semanal'].includes(backupFrequency)) {
        return res.status(400).json({ message: 'Datos de configuración no válidos.' });
    }
    
    const newSettings = { autoBackupEnabled, backupFrequency };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    res.status(200).json({ message: 'Configuración guardada.' });
};