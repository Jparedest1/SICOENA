// sicoena-backend/src/controllers/backupController.js
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// --- Constantes ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');
const BACKUP_METADATA_FILE = path.join(DATA_DIR, 'backups.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'backup-settings.json');

// --- Funciones de Utilidad ---
const ensureFilesAndDirs = async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    try { await fs.access(BACKUP_METADATA_FILE); } catch { await fs.writeFile(BACKUP_METADATA_FILE, JSON.stringify([])); }
    try { await fs.access(SETTINGS_FILE); } catch { await fs.writeFile(SETTINGS_FILE, JSON.stringify({ autoBackupEnabled: true, backupFrequency: 'Diario' })); }
};

const readBackups = async () => JSON.parse(await fs.readFile(BACKUP_METADATA_FILE, 'utf-8'));

const writeBackups = async (backups) => await fs.writeFile(BACKUP_METADATA_FILE, JSON.stringify(backups, null, 2));

// ¡LA FUNCIÓN QUE FALTABA!
const updateBackupStatus = async (backupId, newStatus, details = {}) => {
    try {
        console.log(`[updateBackupStatus] Intentando actualizar ${backupId} a ${newStatus}`);
        const allBackups = await readBackups();
        const backupIndex = allBackups.findIndex(b => b.id === backupId);

        if (backupIndex === -1) {
            console.error(`[updateBackupStatus] ERROR CRÍTICO: No se encontró el backup con ID ${backupId} para actualizar.`);
            return;
        }

        allBackups[backupIndex] = { ...allBackups[backupIndex], ...details, status: newStatus };
        await writeBackups(allBackups);
        console.log(`[updateBackupStatus] ✅ Respaldo ${backupId} actualizado exitosamente a ${newStatus}.`);
    } catch (error) {
        console.error(`[updateBackupStatus] ❌ Falló la actualización del estado para ${backupId}:`, error);
    }
};


// --- Controladores ---

exports.getBackups = async (req, res) => {
    await ensureFilesAndDirs();
    const backups = await readBackups();
    res.json(backups);
};

exports.createBackup = async (req, res) => {
    await ensureFilesAndDirs();
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupId = `BKP-MANUAL-${timestamp}`;
    const backupFileName = `${backupId}.sql`;

    const newBackupMetadata = {
        id: backupId,
        date: now.toISOString(),
        type: 'Manual',
        status: 'EN PROGRESO',
        size: 'N/A',
        initiatedBy: req.user.email,
        fileName: backupFileName,
    };

    try {
        const backups = await readBackups();
        backups.unshift(newBackupMetadata);
        await writeBackups(backups);
        console.log(`[createBackup] Registro para ${backupId} creado como EN PROGRESO.`);
    } catch (initialError) {
        console.error('[createBackup] Error al registrar el inicio del respaldo:', initialError);
        return res.status(500).json({ message: "No se pudo iniciar el proceso de respaldo." });
    }

    res.status(202).json({ message: 'Respaldo iniciado.', backup: newBackupMetadata });

    try {
        const { DB_DATABASE, DB_USER, DB_PASSWORD, DB_HOST } = process.env;
        const backupFilePath = path.join(BACKUPS_DIR, backupFileName);
        const dumpCommand = `mysqldump --host=${DB_HOST} --user=${DB_USER} --databases ${DB_DATABASE} > "${backupFilePath}"`;
        
        console.log(`[createBackup] Ejecutando mysqldump para ${backupId}...`);
        
        await execPromise(dumpCommand, { env: { ...process.env, MYSQL_PWD: DB_PASSWORD } });

        console.log(`[createBackup] mysqldump para ${backupId} finalizado.`);

        const stats = await fs.stat(backupFilePath);
        if (stats.size === 0) throw new Error("El archivo de respaldo se creó pero está vacío.");

        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        await updateBackupStatus(backupId, 'COMPLETADO', { size: `${sizeInMB} MB` });

    } catch (error) {
        console.error(`[createBackup] ❌ Error durante el proceso de mysqldump para ${backupId}:`, error);
        await updateBackupStatus(backupId, 'FALLIDO');
    }
};

exports.restoreBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToRestore = backups.find(b => b.id === id);

    if (!backupToRestore || backupToRestore.status !== 'COMPLETADO') {
        return res.status(400).json({ message: 'Respaldo no válido para restauración.' });
    }
    
    const backupFilePath = path.join(BACKUPS_DIR, backupToRestore.fileName);

    try {
        const { DB_DATABASE, DB_USER, DB_PASSWORD, DB_HOST } = process.env;
        const restoreCommand = `mysql --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} ${DB_DATABASE} < "${backupFilePath}"`;
        await execPromise(restoreCommand);
        res.status(200).json({ message: `Restauración desde ${id} completada.` });
    } catch (error) {
        console.error(`Error al restaurar desde ${id}:`, error);
        res.status(500).json({ message: 'Ocurrió un error durante la restauración.' });
    }
};

exports.deleteBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToDelete = backups.find(b => b.id === id);
    if (!backupToDelete) return res.status(404).json({ message: 'Respaldo no encontrado.' });
    try {
        const filePath = path.join(BACKUPS_DIR, backupToDelete.fileName);
        await fs.unlink(filePath);
        const updatedBackups = backups.filter(b => b.id !== id);
        await writeBackups(updatedBackups);
        res.status(200).json({ message: `Respaldo ${id} eliminado.` });
    } catch (error) {
        console.error(`Error al eliminar el respaldo ${id}:`, error);
        res.status(500).json({ message: 'Error al eliminar el archivo de respaldo.' });
    }
};

exports.downloadBackup = async (req, res) => {
    const { id } = req.params;
    const backups = await readBackups();
    const backupToDownload = backups.find(b => b.id === id);
    if (!backupToDownload || backupToDownload.status !== 'COMPLETADO') return res.status(404).json({ message: 'Respaldo no disponible.' });
    const filePath = path.join(BACKUPS_DIR, backupToDownload.fileName);
    res.download(filePath, backupToDownload.fileName, (err) => {
        if (err) {
            console.error("Error al descargar el archivo:", err);
            res.status(500).send("No se pudo descargar el archivo.");
        }
    });
};

exports.getBackupSettings = async (req, res) => {
    await ensureFilesAndDirs();
    const settingsData = await fs.readFile(SETTINGS_FILE, 'utf-8');
    res.json(JSON.parse(settingsData));
};

exports.saveBackupSettings = async (req, res) => {
    const { autoBackupEnabled, backupFrequency } = req.body;
    if (typeof autoBackupEnabled !== 'boolean' || !['Diario', 'Semanal'].includes(backupFrequency)) {
        return res.status(400).json({ message: 'Datos de configuración no válidos.' });
    }
    const newSettings = { autoBackupEnabled, backupFrequency };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    res.status(200).json({ message: 'Configuración guardada.' });
};