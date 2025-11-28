# app/routers/chatbot.py
from fastapi import APIRouter
import pandas as pd
from typing import Optional
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from app.config import PROC_DIR, OPENAI_EMBEDDINGS_URL, GITHUB_TOKEN, MODEL_NAME
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# Inicializar cliente
client = ChatCompletionsClient(
    endpoint=OPENAI_EMBEDDINGS_URL,
    credential=AzureKeyCredential(GITHUB_TOKEN),
)

def _summary(municipio: Optional[str], delito: Optional[str]):
    df = pd.read_parquet(PROC_DIR / "features.parquet")
    df = df[df["departamento"] == "SANTANDER"].copy()
    if municipio and "municipio" in df.columns:
        df = df[df["municipio"] == municipio.upper()]
    if delito and "tipo_delito" in df.columns:
        df = df[df["tipo_delito"] == delito.upper()]
    total = int(df["cantidad"].sum()) if "cantidad" in df.columns else 0
    hora_counts = (
        df.groupby("franja_hora")["cantidad"].sum().sort_values(ascending=False)
        if "franja_hora" in df.columns else pd.Series(dtype=int)
    )
    hora = hora_counts.index[0] if len(hora_counts) else "SIN_DATO"
    top_muni = (
        df.groupby("municipio")["cantidad"].sum().sort_values(ascending=False).head(3).index.tolist()
        if "municipio" in df.columns else []
    )
    reco = [
        f"Evita desplazarte en {hora.lower()} en zonas de alta concentración.",
        "Usa rutas iluminadas y comparte itinerarios con familiares.",
        "Reporta incidentes por canales oficiales (123).",
    ]
    return total, hora, top_muni, reco

@router.post("/ask", response_model=ChatResponse)
def ask(req: ChatRequest):
    import unicodedata

    # Función de normalización: minúsculas + quitar tildes
    def normalize(text: str) -> str:
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = unicodedata.normalize("NFD", text)
        return "".join(ch for ch in text if unicodedata.category(ch) != "Mn")

    # Cargar datos
    df = pd.read_parquet(PROC_DIR / "features.parquet")
    df = df[df["departamento"] == "SANTANDER"].copy()

    pregunta = normalize(req.pregunta)

    # setectar entidades clave 
    def detectar(lista, texto):
        lista_norm = [normalize(item) for item in lista]
        return next((lista[i] for i, item in enumerate(lista_norm) if item in texto), None)

    municipio = detectar(df["municipio"].dropna().unique(), pregunta)
    tipo_delito = detectar(df["tipo_delito"].dropna().unique(), pregunta)
    grupo_etario = detectar(df["grupo_etario"].dropna().unique(), pregunta)
    franja_hora = detectar(df["franja_hora"].dropna().unique(), pregunta)
    genero = detectar(df["genero"].dropna().unique(), pregunta)

    # Aplicar filtros dinámicos 
    df_filtrado = df.copy()
    if municipio:
        df_filtrado = df_filtrado[df_filtrado["municipio"] == municipio]
    if tipo_delito:
        df_filtrado = df_filtrado[df_filtrado["tipo_delito"] == tipo_delito]
    if grupo_etario:
        df_filtrado = df_filtrado[df_filtrado["grupo_etario"] == grupo_etario]
    if franja_hora:
        df_filtrado = df_filtrado[df_filtrado["franja_hora"] == franja_hora]
    if genero:
        df_filtrado = df_filtrado[df_filtrado["genero"] == genero]

    # generar resumen 
    total = int(df_filtrado["cantidad"].sum())
    hora = df_filtrado["franja_hora"].value_counts().idxmax() if not franja_hora and not df_filtrado.empty else (franja_hora or "SIN_DATO")
    top_muni = df_filtrado["municipio"].value_counts().head(3).index.tolist()
    reco = [
        f"Evita desplazarte en la franja {hora.lower()} en zonas de alta concentración.",
        "Usa rutas iluminadas y comparte itinerarios con familiares.",
        "Reporta incidentes por canales oficiales (123).",
    ]

    # construir prompt para el LLM 
    prompt = f"""
    Usuario pregunta: {req.pregunta}

    Entidades detectadas:
    - Municipio: {municipio or "no especificado"}
    - Tipo de delito: {tipo_delito or "no especificado"}
    - Grupo etario: {grupo_etario or "no especificado"}
    - Franja horaria: {franja_hora or "no especificada"}
    - Género: {genero or "no especificado"}

    Datos filtrados:
    - Total de eventos registrados: {total}
    - Franja horaria de mayor riesgo: {hora}
    - Municipios críticos relacionados: {', '.join(top_muni) if top_muni else 'SIN_DATO'}
    - Recomendaciones preventivas: {'; '.join(reco)}

    Responde como asistente comunitario de seguridad ciudadana,
    con un tono claro, útil y preventivo, integrando los datos anteriores en la respuesta.
    """

    response = client.complete(
        messages=[
            SystemMessage(content="Eres un asistente comunitario de seguridad ciudadana."),
            UserMessage(content=prompt)
        ],
        temperature=0.7,
        top_p=1.0,
        model=MODEL_NAME
    )

    return ChatResponse(answer=response.choices[0].message.content)





@router.get("/quick/{tipo}", response_model=ChatResponse)
def quick(tipo: str, municipio: Optional[str] = None):
    tipo = tipo.lower()
    if tipo == "estadisticas":
        total, hora, top_muni, _ = _summary(municipio, None)
        muni_txt = f" en {municipio}" if municipio else ""
        return ChatResponse(answer=f"Total de eventos{muni_txt}: {total}. Franja de mayor riesgo: {hora}.")
    elif tipo == "prediccion":
        response = client.complete(
            messages=[
                SystemMessage(content="Eres un asistente comunitario."),
                UserMessage(content="Genera una predicción de seguridad ciudadana para los próximos meses en Santander.")
            ],
            model=MODEL_NAME
        )
        return ChatResponse(answer=response.choices[0].message.content)
    elif tipo == "situacion":
        total, hora, top_muni, _ = _summary(municipio, None)
        return ChatResponse(
            answer=f"Situación en {municipio or 'el área'}: {total} eventos. Riesgo mayor en {hora}. "
                   f"Zonas críticas: {', '.join(top_muni) if top_muni else 'SIN_DATO'}."
        )
    else:
        return ChatResponse(answer="Opciones válidas: estadisticas, prediccion, situacion.")
