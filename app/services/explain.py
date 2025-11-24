# app/services/explain.py
import shap
import joblib
import pandas as pd
from app.config import MODELS_DIR, PROC_DIR

def explain_sample(n=1000):
    # Cargar modelo entrenado
    model = joblib.load(MODELS_DIR / "risk_model.pkl")

    # Cargar features y filtrar solo Santander
    df = pd.read_parquet(PROC_DIR / "features.parquet")
    df = df[df["departamento"] == "SANTANDER"].copy()

    # Agregación mensual por municipio
    agg = df.groupby(["departamento","municipio","anio","mes"], as_index=False).agg({
        "tasa_delitos_muni_mes":"mean",
        "tasa_delitos_dep_mes":"mean",
        "acumulado_90d":"mean"
    })

    # Selección de variables para explicar
    X = agg[[
        "departamento","municipio","anio","mes",
        "tasa_delitos_muni_mes","tasa_delitos_dep_mes","acumulado_90d"
    ]].head(n)

    # Transformar con el preprocesador del pipeline
    X_trans = model.named_steps["pre"].transform(X)

    # Crear explainer sobre el clasificador final
    explainer = shap.Explainer(model.named_steps["clf"], X_trans)

    # Calcular valores SHAP
    shap_values = explainer(X_trans)

    return shap_values, X
