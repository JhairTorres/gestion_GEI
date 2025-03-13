module.exports = (sequelize, DataTypes) => {
    return sequelize.define('TiposGas', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        potencial_calentamiento_global: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }, {
        tableName: 'tipos_gas',
        timestamps: false
    });
};
module.exports = TiposGas;
