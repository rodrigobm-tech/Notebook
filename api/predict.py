from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(_name_)
CORS(app)

# Cargar modelo y scaler
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(_file_)))
model_path = os.path.join(BASE_DIR, "model", "model.pkl")
scaler_path = os.path.join(BASE_DIR, "model", "scaler.pkl")

try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("✓ Modelo y scaler cargados correctamente")
except Exception as e:
    print(f"✗ Error cargando modelo: {e}")
    model = None
    scaler = None

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        # Verificar que están cargados
        if model is None or scaler is None:
            return jsonify({"error": "Modelo no cargado correctamente"}), 500
        
        data = request.json
        print(f"Datos recibidos: {data}")
        
        if hasattr(scaler, 'feature_names_in_'):
            feature_names = scaler.feature_names_in_
            print(f"Columnas esperadas: {feature_names}")
        else:
            feature_names = ['tenure', 'monthlyCharges', 'contract']
        
        # Crear DataFrame 
        features_dict = {}
        for col in feature_names:
            value = None
            for key in data.keys():
                if key.lower() == col.lower():
                    value = float(data[key])
                    break
            
            if value is None:
                return jsonify({"error": f"Falta el campo: {col}"}), 400
            
            features_dict[col] = [value]
        
        df = pd.DataFrame(features_dict)
        print(f"DataFrame creado: {df}")
        
        # Predecir
        X_scaled = scaler.transform(df)
        prob = model.predict_proba(X_scaled)[0][1]
        
        result = {"probability": round(prob * 100, 2)}
        print(f"Resultado: {result}")
        
        return jsonify(result)
        
    except KeyError as e:
        error_msg = f"Campo faltante: {str(e)}"
        print(f"✗ {error_msg}")
        return jsonify({"error": error_msg}), 400
    except ValueError as e:
        error_msg = f"Valor inválido: {str(e)}"
        print(f"✗ {error_msg}")
        return jsonify({"error": error_msg}), 400
    except Exception as e:
        error_msg = f"Error inesperado: {str(e)}"
        print(f"✗ {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": error_msg}), 500

@app.route("/api/health", methods=["GET"])
def health():
    """Endpoint para verificar que el servidor está funcionando"""
    status = {
        "status": "ok",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }
    if hasattr(scaler, 'feature_names_in_'):
        status["expected_features"] = list(scaler.feature_names_in_)
    return jsonify(status)

if _name_ == "_main_":
    app.run(debug=True, port=5000)
