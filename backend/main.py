import os

from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware


# Create FastAPI application
app = FastAPI(
    title="Employee Salary AI API",
    description="AI API for predicting employee salary category"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_URLS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained ML model
model = joblib.load("models/salary_model.pkl")


# Request data structure
# class EmployeeData(BaseModel):
#     experience_years: float
#     technical_score: float
#     interview_score: float



class EmployeeData(BaseModel):
    experience_years: float = Field(
        default=4,
        ge=0,
        le=50
    )

    technical_score: float = Field(
        default=78,
        ge=0,
        le=100
    )

    interview_score: float = Field(
        default=82,
        ge=0,
        le=100
    )

# Test endpoint
@app.get("/")
def home():
    return {
        "message": "Employee Salary AI API is running"
    }


# Prediction endpoint
@app.post("/predict")
def predict_salary(employee: EmployeeData):

    # Convert request data into DataFrame
    data = pd.DataFrame(
        [[
            employee.experience_years,
            employee.technical_score,
            employee.interview_score
        ]],
        columns=[
            "experience_years",
            "technical_score",
            "interview_score"
        ]
    )

    # Make prediction
    prediction = model.predict(data)

    # Get probabilities
    probability = model.predict_proba(data)

    # Convert prediction to readable value
    if prediction[0] == 1:
        salary_category = "HIGH"
    else:
        salary_category = "LOW"

    return {
        "salary_category": salary_category,
        "low_probability": round(
            probability[0][0] * 100, 2
        ),
        "high_probability": round(
            probability[0][1] * 100, 2
        )
    }