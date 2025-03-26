import os
import pandas as pd
import plotly.express as px
from sqlalchemy import create_engine
from datetime import datetime

# Configurar conexión a la base de datos
engine = create_engine("mysql+pymysql://root:@localhost/gestion_gei")

# Consulta SQL optimizada para los nuevos datos
query = """
    SELECT 
        e.id,
        e.cantidad_emision,
        e.periodo,
        f.nombre AS fuente,
        f.sector,
        g.nombre AS gas,
        g.potencial_calentamiento_global AS pcg,
        u.pais,
        u.region,
        u.ciudad
    FROM emisiones e
    JOIN fuentes_emisoras f ON e.fuente_id = f.id
    JOIN tipos_gas g ON e.gas_id = g.id
    JOIN ubicaciones u ON e.ubicacion_id = u.id
    WHERE e.is_deleted = 0
    ORDER BY e.periodo DESC;
"""

# Leer datos con manejo de errores mejorado
try:
    emisiones = pd.read_sql(query, engine, parse_dates=['periodo'])
    print(f"Datos cargados correctamente. {len(emisiones)} registros encontrados.")
except Exception as e:
    print(f"Error al conectar con la base de datos: {str(e)}")
    exit()

# Verificar datos y crear visualizaciones
if emisiones.empty:
    print("No se encontraron registros de emisiones.")
else:
    # Configurar directorio de salida
    os.makedirs("public/graficas", exist_ok=True)
    current_date = datetime.now().strftime("%Y%m%d")
    
    # 1. Gráfico de emisiones por tipo de gas (actualizado)
    emisiones_por_gas = emisiones.groupby(['gas', 'pcg'], as_index=False)['cantidad_emision'].sum()
    
    fig_gas = px.bar(
        emisiones_por_gas,
        x='gas',
        y='cantidad_emision',
        color='pcg',
        title=f'Emisiones Totales por Tipo de Gas (CO₂e) - {current_date}',
        labels={
            'gas': 'Tipo de Gas',
            'cantidad_emision': 'Toneladas de CO₂ equivalente',
            'pcg': 'Potencial Calentamiento'
        },
        hover_data=['pcg'],
        color_continuous_scale='thermal'
    )
    fig_gas.update_layout(
        xaxis_tickangle=-45,
        hovermode='x unified',
        yaxis_title='Toneladas CO₂ equivalente',
        coloraxis_colorbar_title='PCG'
    )
    fig_gas.write_html("public/graficas/emisiones_por_gas.html")
    
    # 2. Gráfico de emisiones por sector económico (nuevo)
    emisiones_por_sector = emisiones.groupby('sector', as_index=False)['cantidad_emision'].sum()
    
    fig_sector = px.pie(
        emisiones_por_sector,
        names='sector',
        values='cantidad_emision',
        title=f'Distribución de Emisiones por Sector - {current_date}',
        hole=0.3,
        labels={'sector': 'Sector Económico', 'cantidad_emision': 'Emisiones'}
    )
    fig_sector.update_traces(textposition='inside', textinfo='percent+label')
    fig_sector.write_html("public/graficas/emisiones_por_sector.html")
    
    # 3. Mapa de calor por país y tipo de gas (nuevo)
    emisiones_pais_gas = emisiones.groupby(['pais', 'gas'], as_index=False)['cantidad_emision'].sum()
    
    fig_mapa = px.treemap(
        emisiones_pais_gas,
        path=['pais', 'gas'],
        values='cantidad_emision',
        title=f'Mapa de Emisiones por País y Tipo de Gas - {current_date}',
        color='cantidad_emision',
        color_continuous_scale='Reds'
    )
    fig_mapa.write_html("public/graficas/mapa_emisiones.html")
    
    # 4. Serie temporal de emisiones (nuevo)
    emisiones_mensuales = emisiones.groupby(
        pd.Grouper(key='periodo', freq='M')
    )['cantidad_emision'].sum().reset_index()
    
    fig_temporal = px.line(
        emisiones_mensuales,
        x='periodo',
        y='cantidad_emision',
        title='Evolución Mensual de Emisiones',
        labels={'periodo': 'Fecha', 'cantidad_emision': 'Toneladas CO₂e'}
    )
    fig_temporal.update_xaxes(rangeslider_visible=True)
    fig_temporal.write_html("public/graficas/evolucion_emisiones.html")
    
    print(f"""
    Reportes generados correctamente:
    - public/graficas/emisiones_por_gas.html
    - public/graficas/emisiones_por_sector.html
    - public/graficas/mapa_emisiones.html
    - public/graficas/evolucion_emisiones.html
    """)
