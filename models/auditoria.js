module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Auditoria', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        accion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'auditoria',
        timestamps: false
    });
};
module.exports = Auditoria;