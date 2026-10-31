from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
from typing import Literal
from pydantic import BaseModel, Field, field_validator




app = FastAPI(title="Customer Churn Prediction API")

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model ──
model = joblib.load("Churn_model2.pkl")


class Features(BaseModel):
    gender: Literal['Female', 'Male']
    SeniorCitizen: Literal['Yes', 'No']
    Partner: Literal['Yes', 'No']
    Dependents: Literal['Yes', 'No']
    tenure: int = Field(..., ge=0, le=72)
    PhoneService: Literal['Yes', 'No']
    MultipleLines: Literal['Yes', 'No', 'No phone service']
    InternetService: Literal['DSL', 'Fiber optic', 'No']
    OnlineSecurity: Literal['Yes', 'No', 'No internet service']
    OnlineBackup: Literal['Yes', 'No', 'No internet service']
    DeviceProtection: Literal['Yes', 'No', 'No internet service']
    TechSupport: Literal['Yes', 'No', 'No internet service']
    StreamingTV: Literal['Yes', 'No', 'No internet service']
    StreamingMovies: Literal['Yes', 'No', 'No internet service']
    Contract: Literal['Month-to-month', 'One year', 'Two year']
    PaperlessBilling: Literal['Yes', 'No']
    PaymentMethod: Literal['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']
    MonthlyCharges: float = Field(..., ge=0)
    TotalCharges: float = Field(..., ge=0)

    @field_validator("SeniorCitizen")
    @classmethod
    def convert_senior_citizen(cls, v):
        mapping = {"yes": 1, "no": 0}
        v_lower = v.strip().lower()
        if v_lower not in mapping:
            raise ValueError("SeniorCitizen must be 'Yes' or 'No'")
        return mapping[v_lower]


@app.post('/predict')
def predict(features: Features):
    input_df = pd.DataFrame([features.model_dump()])

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0]

    return {
        "prediction": "Yes" if int(prediction) == 1 else "No",
        "churn_probability": round(float(probability[1]), 4),
        "no_churn_probability": round(float(probability[0]), 4)
    }



