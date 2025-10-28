// sicoena-backend/src/controllers/settingsController.js
const db = require('../config/db');

// --- Obtener todas las configuraciones ---
exports.getAllSettings = async (req, res) => {
    try {
        const [settings] = await db.query(`
            SELECT 
                id_config,
                clave,
                valor,
                descripcion,
                tipo,
                fecha_actualizacion
            FROM configuracion_sistema
            ORDER BY clave ASC
        `);

        // Convertir a objeto por clave para facilitar el acceso
        const settingsObj = {};
        settings.forEach(setting => {
            // Convertir valores según su tipo
            let value = setting.valor;
            if (setting.tipo === 'boolean') {
                value = value === '1' || value === true;
            } else if (setting.tipo === 'number') {
                value = parseInt(value);
            } else if (setting.tipo === 'json') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = null;
                }
            }
            settingsObj[setting.clave] = value;
        });

        res.status(200).json(settingsObj);
    } catch (error) {
        console.error("Error al obtener configuraciones:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener configuraciones.' });
    }
};

// --- Obtener configuración por sección ---
exports.getSettingsBySection = async (req, res) => {
    try {
        const { section } = req.params;

        // Mapeo de secciones a claves
        const sectionMap = {
            general: ['empresa_nombre', 'empresa_nit', 'empresa_direccion', 'empresa_telefono', 'empresa_email'],
            sistema: ['sistema_moneda', 'sistema_idioma', 'sistema_backup_frecuencia', 'sistema_notificaciones'],
            seguridad: ['seguridad_session_timeout', 'seguridad_password_expiry', 'seguridad_two_factor'],
            email: ['email_smtp_server', 'email_smtp_port', 'email_smtp_user', 'email_smtp_password', 'email_from']
        };

        if (!sectionMap[section]) {
            return res.status(400).json({ message: 'Sección inválida.' });
        }

        const placeholders = sectionMap[section].map(() => '?').join(',');
        const [settings] = await db.query(`
            SELECT 
                clave,
                valor,
                tipo
            FROM configuracion_sistema
            WHERE clave IN (${placeholders})
        `, sectionMap[section]);

        // Convertir a objeto
        const result = {};
        settings.forEach(setting => {
            let value = setting.valor;
            if (setting.tipo === 'boolean') {
                value = value === '1' || value === true;
            } else if (setting.tipo === 'number') {
                value = parseInt(value);
            } else if (setting.tipo === 'json') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = null;
                }
            }
            result[setting.clave] = value;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener configuraciones por sección:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- Actualizar configuraciones ---
exports.updateSettings = async (req, res) => {
    try {
        const { section } = req.params;
        const userId = req.user.id; // Del token JWT
        const payload = req.body;

        // Mapeo de secciones a claves
        const sectionMap = {
            general: {
                companyName: 'empresa_nombre',
                companyNit: 'empresa_nit',
                companyAddress: 'empresa_direccion',
                companyPhone: 'empresa_telefono',
                companyEmail: 'empresa_email'
            },
            sistema: {
                defaultCurrency: 'sistema_moneda',
                systemLanguage: 'sistema_idioma',
                backupFrequency: 'sistema_backup_frecuencia',
                enableNotifications: 'sistema_notificaciones'
            },
            seguridad: {
                sessionTimeout: 'seguridad_session_timeout',
                passwordExpiry: 'seguridad_password_expiry',
                enableTwoFactor: 'seguridad_two_factor'
            },
            email: {
                smtpServer: 'email_smtp_server',
                smtpPort: 'email_smtp_port',
                smtpUser: 'email_smtp_user',
                smtpPassword: 'email_smtp_password',
                emailFrom: 'email_from'
            }
        };

        if (!sectionMap[section]) {
            return res.status(400).json({ message: 'Sección inválida.' });
        }

        // Actualizar cada configuración
        const updates = [];
        for (const [frontendKey, dbKey] of Object.entries(sectionMap[section])) {
            if (payload.hasOwnProperty(frontendKey)) {
                let value = payload[frontendKey];

                // Convertir boolean a 0/1
                if (typeof value === 'boolean') {
                    value = value ? 1 : 0;
                }

                updates.push(
                    db.query(
                        `UPDATE configuracion_sistema 
                         SET valor = ?, fecha_actualizacion = NOW(), actualizado_por = ? 
                         WHERE clave = ?`,
                        [value, userId, dbKey]
                    )
                );
            }
        }

        // Ejecutar todas las actualizaciones
        await Promise.all(updates);

        res.status(200).json({
            message: `Configuración de "${section}" actualizada exitosamente.`,
            section: section
        });

    } catch (error) {
        console.error("Error al actualizar configuraciones:", error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar configuraciones.' });
    }
};

// --- Actualizar una configuración individual ---
exports.updateSingleSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        const userId = req.user.id;

        // Validar que la clave exista
        const [existing] = await db.query(
            'SELECT clave, tipo FROM configuracion_sistema WHERE clave = ?',
            [key]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Configuración no encontrada.' });
        }

        // Convertir valor según tipo
        let finalValue = value;
        if (existing[0].tipo === 'boolean') {
            finalValue = value ? 1 : 0;
        }

        // Actualizar
        await db.query(
            `UPDATE configuracion_sistema 
             SET valor = ?, fecha_actualizacion = NOW(), actualizado_por = ? 
             WHERE clave = ?`,
            [finalValue, userId, key]
        );

        res.status(200).json({
            message: 'Configuración actualizada exitosamente.',
            key: key,
            value: value
        });

    } catch (error) {
        console.error("Error al actualizar configuración:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- Obtener una configuración individual ---
exports.getSingleSetting = async (req, res) => {
    try {
        const { key } = req.params;

        const [setting] = await db.query(
            'SELECT valor, tipo FROM configuracion_sistema WHERE clave = ?',
            [key]
        );

        if (setting.length === 0) {
            return res.status(404).json({ message: 'Configuración no encontrada.' });
        }

        let value = setting[0].valor;
        if (setting[0].tipo === 'boolean') {
            value = value === '1' || value === true;
        } else if (setting[0].tipo === 'number') {
            value = parseInt(value);
        } else if (setting[0].tipo === 'json') {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = null;
            }
        }

        res.status(200).json({
            clave: key,
            valor: value
        });

    } catch (error) {
        console.error("Error al obtener configuración:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};