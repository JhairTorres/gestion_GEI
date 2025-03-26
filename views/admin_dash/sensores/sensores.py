import pandas as pd
import folium
from sqlalchemy import create_engine

# Configurar conexión
engine = create_engine("mysql+pymysql://root:@localhost/gestion_gei")

# Consulta SQL para extraer los sensores con coordenadas
query = """
    SELECT id, nombre_sensor, id_ubicacion, 
    ST_X(ubicacion_geografica) AS longitud, 
    ST_Y(ubicacion_geografica) AS latitud
    FROM sensores
    WHERE ubicacion_geografica IS NOT NULL;
"""

# Leer datos
try:
    sensores = pd.read_sql(query, engine)
except Exception as e:
    print(f"Error al ejecutar la consulta SQL: {e}")
    exit()

# Verificar si hay datos
if sensores.empty:
    print("No se encontraron sensores con coordenadas.")
else:
    # Crear un mapa centrado en una ubicación promedio
    center_lat = sensores['latitud'].mean()
    center_long = sensores['longitud'].mean()
    mapa = folium.Map(location=[center_lat, center_long], zoom_start=5)

    # Agregar los sensores al mapa
    for _, row in sensores.iterrows():
        folium.Marker(
            location=[row['latitud'], row['longitud']],
            popup=f"{row['nombre_sensor']} (ID {row['id']})",
            icon=folium.Icon(color='blue', icon='info-sign')
        ).add_to(mapa)

    # Guardar como archivo HTML
    mapa.save("public/mapas/mapa_sensores.html")
    print(" Mapa generado correctamente: mapa_sensores.html")