module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Emisiones', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fuente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gas_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ubicacion_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad_emision: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        periodo: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'emisiones',
        timestamps: false
    });
};
module.exports = Emisiones;