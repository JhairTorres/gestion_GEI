module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Ubicaciones', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pais: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        region: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        ciudad: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'ubicaciones',
        timestamps: false
    });
};
module.exports = Ubicaciones;