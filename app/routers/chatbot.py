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
    total, hora, top_muni, reco = _summary(req.municipio, req.delito)

    prompt = f"""
    Usuario pregunta: {req.pregunta}
    Municipio: {req.municipio or "SIN_DATO"}
    Delito: {req.delito or "SIN_DATO"}

    Datos recientes:
    - Total de eventos: {total}
    - Franja de mayor riesgo: {hora}
    - Municipios críticos: {', '.join(top_muni) if top_muni else 'SIN_DATO'}
    - Recomendaciones: {'; '.join(reco)}

    Responde como asistente comunitario de seguridad ciudadana,
    con un tono claro y útil, integrando los datos anteriores en la respuesta.
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
