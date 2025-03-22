import os
import pandas as pd
import plotly.express as px
from sqlalchemy import create_engine

# Configurar conexión
engine = create_engine("mysql+pymysql://root:@localhost/gestion_gei")

# Consulta SQL para obtener los datos de emisiones
query = """
    SELECT 
        e.id,
        e.cantidad_emision,
        e.periodo,
        f.nombre AS fuente,
        g.nombre AS gas,
        u.pais,
        u.region,
        u.ciudad
    FROM emisiones e
    LEFT JOIN fuentes_emisoras f ON e.fuente_id = f.id
    LEFT JOIN tipos_gas g ON e.gas_id = g.id
    LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id;
"""

# Leer datos
try:
    emisiones = pd.read_sql(query, engine)
except Exception as e:
    print(f"Error al ejecutar la consulta SQL: {e}")
    exit()

# Verificar si hay datos
if emisiones.empty:
    print("No se encontraron datos de emisiones.")
    exit()
else:
    # Crear carpeta si no existe
    os.makedirs("public/graficas", exist_ok=True)

    # Convertir la columna 'periodo' a formato datetime
    emisiones['periodo'] = pd.to_datetime(emisiones['periodo'])

    # Agrupar por tipo de gas y sumar las emisiones
    resumen_emisiones = emisiones.groupby('gas', as_index=False)['cantidad_emision'].sum()

    # Crear gráfico de barras con Plotly
    fig = px.bar(
        resumen_emisiones,
        x='gas',
        y='cantidad_emision',
        title='Emisiones Totales por Tipo de Gas',
        labels={'gas': 'Tipo de Gas', 'cantidad_emision': 'Cantidad Emitida (kg)'},
        color='gas'
    )
    fig.update_layout(xaxis_tickangle=-45)

    # Guardar como archivo HTML
    fig.write_html("public/graficas/grafica_emisiones.html")
    print(" Gráfica de emisiones generada correctamente: grafica_emisiones.html")

