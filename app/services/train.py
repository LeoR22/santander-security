# app/services/train.py
import argparse
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve, auc

from app.config import MODELS_DIR, PROC_DIR

def train_model():
    # Cargar features y filtrar solo Santander
    df = pd.read_parquet(PROC_DIR / "features.parquet")
    df = df[df["departamento"] == "SANTANDER"].copy()

    # Definir variables y target (sin municipio)
    features = [
        "departamento", "anio", "mes",
        "tasa_delitos_muni_mes_lag", "tasa_delitos_dep_mes_lag", "acumulado_90d"
    ]
    target = "riesgo_alto"

    # Split temporal: entrenar con todos los años menos el último y validar en el último
    ultimo_anio = int(df["anio"].max())
    train_df = df[df["anio"] < ultimo_anio]
    test_df  = df[df["anio"] == ultimo_anio]

    X_train = train_df[features]
    y_train = train_df[target]
    X_test  = test_df[features]
    y_test  = test_df[target]

    # Ajuste automático si solo hay una clase en train
    if y_train.nunique() < 2:
        print("⚠️ Solo una clase en train, ajustando split...")
        ultimo_mes = int(df["mes"].max())
        train_df = df[(df["anio"] < ultimo_anio) | ((df["anio"] == ultimo_anio) & (df["mes"] < ultimo_mes))]
        test_df  = df[(df["anio"] == ultimo_anio) & (df["mes"] == ultimo_mes)]
        X_train = train_df[features]
        y_train = train_df[target]
        X_test  = test_df[features]
        y_test  = test_df[target]

    # Preprocesamiento de columnas
    cat_cols = ["departamento"]
    num_cols = ["anio", "mes", "tasa_delitos_muni_mes_lag", "tasa_delitos_dep_mes_lag", "acumulado_90d"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", Pipeline([
                ("imputer", SimpleImputer(strategy="constant", fill_value=0)),
                ("scaler", StandardScaler())
            ]), num_cols),
        ]
    )

    # Clasificador
    clf = GradientBoostingClassifier(random_state=42)

    # Pipeline completo
    model = Pipeline(steps=[
        ("pre", preprocessor),
        ("clf", clf)
    ])

    # Entrenar
    model.fit(X_train, y_train)

    # Evaluación (validación temporal)
    y_pred = model.predict(X_test)
    print("📊 Reporte de clasificación (validación temporal):")
    print(classification_report(y_test, y_pred))

    # Métricas adicionales
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]
        roc = roc_auc_score(y_test, y_proba)
        precision, recall, _ = precision_recall_curve(y_test, y_proba)
        pr = auc(recall, precision)
        print(f"ROC-AUC: {roc:.3f}")
        print(f"PR-AUC: {pr:.3f}")

    # Guardar modelo
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "risk_model.pkl")
    print(f"✅ Modelo guardado en {MODELS_DIR / 'risk_model.pkl'}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--train", action="store_true")
    args = parser.parse_args()
    if args.train:
        train_model()
