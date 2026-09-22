import pandas as pd
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# --------------------------------
# 1. Create our dataset
# --------------------------------

data = {
    "experience_years": [
        1, 2, 2, 3, 3,
        4, 4, 5, 5, 6,
        6, 7, 7, 8, 9,
        10, 10, 11, 12, 12
    ],

    "technical_score": [
        45, 50, 55, 58, 62,
        65, 70, 72, 75, 78,
        80, 82, 85, 87, 88,
        90, 92, 93, 95, 97
    ],

    "interview_score": [
        50, 55, 58, 60, 65,
        68, 70, 72, 75, 78,
        80, 82, 85, 87, 89,
        90, 91, 93, 95, 96
    ],

    "salary_category": [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 1,
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 1
    ]
}

df = pd.DataFrame(data)

# print("Dataset:")
# print(df)

X = df[
    [
        "experience_years",
        "technical_score",
        "interview_score"
    ]
]
y = df["salary_category"]

# print("\nFeatures:")
# print(y)

# --------------------------------
# 3. Split training/testing data
# --------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))

model = LogisticRegression()

model.fit(X_train, y_train)

print("\nModel training completed!")

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"\nAccuracy: {accuracy * 100:.2f}%")


print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))


print("\nClassification Report:")
print(classification_report(y_test, predictions))


new_employee = pd.DataFrame(
    [[4, 78, 82]],
    columns=[
        "experience_years",
        "technical_score",
        "interview_score"
    ]
)


prediction = model.predict(new_employee)

probability = model.predict_proba(new_employee)


if prediction[0] == 1:
    salary_category = "HIGH"
else:
    salary_category = "LOW"


print("\nNew Employee Prediction:")
print("Salary Category:", salary_category)

print(
    f"LOW probability: "
    f"{probability[0][0] * 100:.2f}%"
)

print(
    f"HIGH probability: "
    f"{probability[0][1] * 100:.2f}%"
)


# --------------------------------
# 9. Save trained model
# --------------------------------

model_path = "models/salary_model.pkl"

joblib.dump(model, model_path)

print(f"\nModel saved successfully: {model_path}")