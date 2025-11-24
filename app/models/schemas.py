# app/models/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any

# Analytics
class RiskPredictRequest(BaseModel):
    departamento: str = Field(..., example="SANTANDER")
    municipio: Optional[str] = Field(None, example="BUCARAMANGA")
    anio: int
    mes: int

class RiskPredictResponse(BaseModel):
    prediction: int
    probability: float
    used_features: Dict[str, Any]

class MetricsResponse(BaseModel):
    roc_auc: float
    pr_auc: float
    report: dict

class TrendPoint(BaseModel):
    anio: int
    mes: int
    reales: int
    predichos: int

class MunicipioDistributionItem(BaseModel):
    municipio: str
    incidentes: int

# Crimes
class CrimeQuery(BaseModel):
    departamento: str = "SANTANDER"
    municipio: Optional[str] = None
    tipo_delito: Optional[str] = None
    anio: Optional[int] = None
    mes: Optional[int] = None
    limit: int = 100

# Para /crimes/query (estructura simple)
class CrimeRecord(BaseModel):
    departamento: str
    municipio: Optional[str]
    fecha_hecho: str
    tipo_delito: str
    cantidad: int

# Para /crimes/recent (estructura rica para la tabla del frontend)
class CrimeRecentRecord(BaseModel):
    id: str
    tipo: str
    descripcion: str
    ubicacion: str
    fecha: str
    severidad: str
    estado: str

# Geo
class GeoIncident(BaseModel):
    lat: float
    lon: float
    severidad: str
    estado: str
    municipio: str

# Chatbot
class ChatRequest(BaseModel):
    pregunta: str
    municipio: Optional[str] = None
    delito: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
