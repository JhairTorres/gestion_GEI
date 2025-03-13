module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Usuarios', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        clave: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        rol: {
            type: DataTypes.ENUM('Administrador', 'Usuario', 'Auditor'),
            allowNull: false
        }
    }, {
        tableName: 'usuarios',
        timestamps: false
    });
};
module.exports = Usuarios;