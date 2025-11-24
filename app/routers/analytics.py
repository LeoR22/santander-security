# app/routers/analytics.py
from fastapi import APIRouter, HTTPException
from typing import Optional
import joblib
import pandas as pd
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve, auc
from app.config import MODELS_DIR, PROC_DIR
from app.models.schemas import (
    RiskPredictRequest, RiskPredictResponse, MetricsResponse,
    TrendPoint, MunicipioDistributionItem
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

_model = None
_features_df = None

def _load_artifacts():
    global _model, _features_df
    if _model is None:
        _model = joblib.load(MODELS_DIR / "risk_model.pkl")
    if _features_df is None:
        _features_df = pd.read_parquet(PROC_DIR / "features.parquet")
        _features_df = _features_df[_features_df["departamento"] == "SANTANDER"].copy()

#def _feature_row(departamento: str, municipio: str | None, anio: int, mes: int) -> pd.DataFrame:
def _feature_row(departamento: str, municipio: Optional[str], anio: int, mes: int) -> pd.DataFrame:
    df = _features_df
    filt = (df["departamento"] == departamento) & (df["anio"] == anio) & (df["mes"] == mes)
    if municipio and "municipio" in df.columns:
        filt = filt & (df["municipio"] == municipio)
    candidates = df.loc[filt]
    if candidates.empty:
        raise HTTPException(status_code=404, detail="No hay features para ese periodo/ubicación")
    # Usamos la fila con mayor 'cantidad' como representativa
    row = candidates.sort_values("cantidad", ascending=False).head(1)
    return row[[
        "departamento","anio","mes",
        "tasa_delitos_muni_mes_lag","tasa_delitos_dep_mes_lag","acumulado_90d"
    ]]

@router.get("/metrics", response_model=MetricsResponse)
def metrics():
    _load_artifacts()
    df = _features_df
    ultimo_anio = int(df["anio"].max())
    val_df = df[df["anio"] == ultimo_anio].copy()

    X_val = val_df[[
        "departamento","anio","mes",
        "tasa_delitos_muni_mes_lag","tasa_delitos_dep_mes_lag","acumulado_90d"
    ]]
    y_val = val_df["riesgo_alto"]

    if hasattr(_model, "predict_proba"):
        y_proba = _model.predict_proba(X_val)[:, 1]
        roc = float(roc_auc_score(y_val, y_proba))
        precision, recall, _ = precision_recall_curve(y_val, y_proba)
        pr = float(auc(recall, precision))
    else:
        roc = pr = 0.0

    report_dict = classification_report(y_val, _model.predict(X_val), output_dict=True)
    return MetricsResponse(roc_auc=roc, pr_auc=pr, report=report_dict)

@router.get("/risk/predict", response_model=RiskPredictResponse)
def risk_predict(municipio:str = None, anio: int = 2025, mes: int = 11):
    _load_artifacts()
    try:
        X = _feature_row("SANTANDER", municipio, anio, mes)
        y_pred = int(_model.predict(X)[0])
        y_proba = float(_model.predict_proba(X)[0, 1]) if hasattr(_model, "predict_proba") else 0.0
        return RiskPredictResponse(
            prediction=y_pred,
            probability=y_proba,
            used_features=X.iloc[0].to_dict()
        )
    except HTTPException:
        return RiskPredictResponse(
            prediction=0,
            probability=0.0,
            used_features={"departamento": "SANTANDER", "municipio": municipio or "SIN_DATO", "anio": anio, "mes": mes}
        )


@router.get("/prediction/trend", response_model=list[TrendPoint])
def prediction_trend():
    _load_artifacts()
    df = _features_df.copy()

    # Reales: agregamos por año-mes la suma de 'cantidad'
    reales = df.groupby(["anio", "mes"], as_index=False)["cantidad"].sum().rename(columns={"cantidad": "reales"})

    # Predichos: para cada mes, aplicamos el modelo al set del mes y sumamos predicciones (1)
    preds = []
    for (anio, mes), sub in df.groupby(["anio", "mes"]):
        X = sub[[
            "departamento","anio","mes",
            "tasa_delitos_muni_mes_lag","tasa_delitos_dep_mes_lag","acumulado_90d"
        ]]
        y_hat = _model.predict(X)
        preds.append({"anio": int(anio), "mes": int(mes), "predichos": int(y_hat.sum())})
    pred_df = pd.DataFrame(preds)

    merged = reales.merge(pred_df, on=["anio", "mes"], how="left").fillna(0)
    merged = merged.sort_values(["anio", "mes"])
    return [TrendPoint(**r) for r in merged.to_dict(orient="records")]

@router.get("/distribution/municipios", response_model=list[MunicipioDistributionItem])
def distribution_municipios():
    _load_artifacts()
    df = _features_df.copy()
    # Último año para el panel
    ultimo_anio = int(df["anio"].max())
    df = df[df["anio"] == ultimo_anio]
    dist = df.groupby("municipio", as_index=False)["cantidad"].sum().rename(columns={"cantidad": "incidentes"})
    dist = dist.sort_values("incidentes", ascending=False)
    return [MunicipioDistributionItem(**r) for r in dist.to_dict(orient="records")]
