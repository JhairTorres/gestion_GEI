const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TiposGas = require('./tiposGas')(sequelize, DataTypes);
const FuentesEmisoras = require('./fuentesEmisoras')(sequelize, DataTypes);
const Ubicaciones = require('./ubicaciones')(sequelize, DataTypes);
const Emisiones = require('./emisiones')(sequelize, DataTypes);
const Usuarios = require('./usuarios')(sequelize, DataTypes);
const Auditoria = require('./auditoria')(sequelize, DataTypes);
const Sesiones = require('./sesiones')(sequelize, DataTypes);

// Definir relaciones
Emisiones.belongsTo(FuentesEmisoras, { foreignKey: 'fuente_id' });
Emisiones.belongsTo(TiposGas, { foreignKey: 'gas_id' });
Emisiones.belongsTo(Ubicaciones, { foreignKey: 'ubicacion_id' });

Auditoria.belongsTo(Usuarios, { foreignKey: 'usuario_id' });

Sesiones.belongsTo(Usuarios, { foreignKey: 'usuario_id' });

// Sincronización con la base de datos
sequelize.sync({ alter: true })
    .then(() => console.log('Modelos sincronizados con la base de datos'))
    .catch(err => console.error('Error al sincronizar modelos:', err));

module.exports = {
    sequelize,
    TiposGas,
    FuentesEmisoras,
    Ubicaciones,
    Emisiones,
    Usuarios,
    Auditoria,
    Sesiones
};
