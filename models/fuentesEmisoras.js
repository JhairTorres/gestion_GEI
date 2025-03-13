module.exports = (sequelize, DataTypes) => {
    return sequelize.define('FuentesEmisoras', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        sector: {
            type: DataTypes.ENUM('Transporte', 'Energía', 'Industria', 'Agricultura', 'Residuos', 'Otros'),
            allowNull: false
        }
    }, {
        tableName: 'fuentes_emisoras',
        timestamps: false
    });
};
module.exports = FuentesEmisoras;