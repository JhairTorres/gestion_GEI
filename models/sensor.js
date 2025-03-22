module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Sensor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_sensor: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        id_ubicacion: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ubicacion_geografica: {
            type: DataTypes.GEOMETRY('POINT'),
            allowNull: false
        }
    }, {
        tableName: 'sensores',
        timestamps: false
    });
};
module.exports = Sensor;
