import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface FormData {
  experience_years: string;
  technical_score: string;
  interview_score: string;
}

interface PredictionResult {
  salary_category: string;
  low_probability: number;
  high_probability: number;
}

interface FormErrors {
  experience_years?: string;
  technical_score?: string;
  interview_score?: string;
  general?: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    experience_years: "",
    technical_score: "",
    interview_score: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      general: undefined,
    }));

    setResult(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const experience = Number(formData.experience_years);
    const technical = Number(formData.technical_score);
    const interview = Number(formData.interview_score);

    if (formData.experience_years.trim() === "") {
      newErrors.experience_years = "Experience is required.";
    } else if (Number.isNaN(experience)) {
      newErrors.experience_years = "Enter a valid number.";
    } else if (experience < 0) {
      newErrors.experience_years =
        "Experience cannot be negative.";
    } else if (experience > 50) {
      newErrors.experience_years =
        "Experience cannot be greater than 50 years.";
    }

    if (formData.technical_score.trim() === "") {
      newErrors.technical_score =
        "Technical score is required.";
    } else if (Number.isNaN(technical)) {
      newErrors.technical_score =
        "Enter a valid technical score.";
    } else if (technical < 0 || technical > 100) {
      newErrors.technical_score =
        "Technical score must be between 0 and 100.";
    }

    if (formData.interview_score.trim() === "") {
      newErrors.interview_score =
        "Interview score is required.";
    } else if (Number.isNaN(interview)) {
      newErrors.interview_score =
        "Enter a valid interview score.";
    } else if (interview < 0 || interview > 100) {
      newErrors.interview_score =
        "Interview score must be between 0 and 100.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experience_years: Number(
              formData.experience_years
            ),
            technical_score: Number(
              formData.technical_score
            ),
            interview_score: Number(
              formData.interview_score
            ),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 422) {
          setErrors({
            general:
              "The submitted data is invalid. Please check your values.",
          });
        } else {
          setErrors({
            general:
              errorData.detail ||
              "The prediction request failed.",
          });
        }

        return;
      }

      const data: PredictionResult = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setErrors({
        general:
          "Could not connect to the AI backend. Make sure FastAPI is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      experience_years: "",
      technical_score: "",
      interview_score: "",
    });

    setErrors({});
    setResult(null);
  };

  return (
    <div className="app">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="header">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h1>SalaryPredict AI</h1>
            <span>Machine Learning Prediction System</span>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          AI Model Online
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-badge">
            <span>✦</span>
            Powered by Machine Learning
          </div>

          <h2>
            Predict Employee
            <span> Salary Category</span>
          </h2>

          <p>
            Enter employee information below and let the
            trained machine learning model estimate the salary
            category.
          </p>
        </section>

        <section className="dashboard">
          <div className="card input-card">
            <div className="card-header">
              <div>
                <h3>Employee Information</h3>
                <p>
                  Provide the employee's assessment details.
                </p>
              </div>

              <div className="card-number">01</div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="experience_years">
                  <span className="label-icon">💼</span>
                  Experience
                </label>

                <div className="input-wrapper">
                  <input
                    id="experience_years"
                    type="number"
                    name="experience_years"
                    min="0"
                    max="50"
                    step="0.1"
                    placeholder="e.g. 4"
                    value={formData.experience_years}
                    onChange={handleChange}
                  />

                  <span className="input-suffix">
                    Years
                  </span>
                </div>

                {errors.experience_years && (
                  <p className="field-error">
                    {errors.experience_years}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="technical_score">
                  <span className="label-icon">⚙</span>
                  Technical Score
                </label>

                <div className="input-wrapper">
                  <input
                    id="technical_score"
                    type="number"
                    name="technical_score"
                    min="0"
                    max="100"
                    placeholder="e.g. 78"
                    value={formData.technical_score}
                    onChange={handleChange}
                  />

                  <span className="input-suffix">
                    / 100
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        Number(formData.technical_score) || 0,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                {errors.technical_score && (
                  <p className="field-error">
                    {errors.technical_score}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="interview_score">
                  <span className="label-icon">◎</span>
                  Interview Score
                </label>

                <div className="input-wrapper">
                  <input
                    id="interview_score"
                    type="number"
                    name="interview_score"
                    min="0"
                    max="100"
                    placeholder="e.g. 82"
                    value={formData.interview_score}
                    onChange={handleChange}
                  />

                  <span className="input-suffix">
                    / 100
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        Number(formData.interview_score) || 0,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                {errors.interview_score && (
                  <p className="field-error">
                    {errors.interview_score}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="general-error">
                  <span>!</span>
                  {errors.general}
                </div>
              )}

              <div className="button-row">
                <button
                  type="button"
                  className="reset-button"
                  onClick={handleReset}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="predict-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Predicting...
                    </>
                  ) : (
                    <>
                      Predict Salary
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="card result-card">
            <div className="card-header">
              <div>
                <h3>Prediction Result</h3>
                <p>
                  AI model prediction and confidence.
                </p>
              </div>

              <div className="card-number">02</div>
            </div>

            {!result && !loading && (
              <div className="empty-state">
                <div className="empty-icon">✦</div>

                <h4>Ready for prediction</h4>

                <p>
                  Enter the employee information and click
                  <strong> Predict Salary</strong> to see the AI
                  result.
                </p>
              </div>
            )}

            {loading && (
              <div className="empty-state">
                <div className="loading-orbit"></div>

                <h4>Analyzing employee data...</h4>

                <p>
                  The machine learning model is processing the
                  input.
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="result-content">
                <div
                  className={`prediction-badge ${
                    result.salary_category === "HIGH"
                      ? "high"
                      : "low"
                  }`}
                >
                  <span className="prediction-dot"></span>

                  {result.salary_category} SALARY
                </div>

                <div className="main-result">
                  <span className="result-label">
                    Predicted Category
                  </span>

                  <h4>{result.salary_category}</h4>

                  <p>
                    Based on the employee's provided
                    information
                  </p>
                </div>

                <div className="probability-section">
                  <div className="probability-header">
                    <span>Prediction Confidence</span>

                    <span>
                      {Math.max(
                        result.high_probability,
                        result.low_probability
                      ).toFixed(2)}
                      %
                    </span>
                  </div>

                  <div className="confidence-track">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.max(
                          result.high_probability,
                          result.low_probability
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="probability-grid">
                  <div className="probability-box">
                    <span className="probability-title">
                      LOW Salary
                    </span>

                    <strong>
                      {result.low_probability.toFixed(2)}%
                    </strong>

                    <div className="mini-track">
                      <div
                        style={{
                          width: `${result.low_probability}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="probability-box">
                    <span className="probability-title">
                      HIGH Salary
                    </span>

                    <strong>
                      {result.high_probability.toFixed(2)}%
                    </strong>

                    <div className="mini-track">
                      <div
                        style={{
                          width: `${result.high_probability}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="info-section">
          <div className="info-item">
            <div className="info-icon">ML</div>
            <div>
              <strong>Machine Learning</strong>
              <span>Logistic Regression</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">API</div>
            <div>
              <strong>Backend API</strong>
              <span>FastAPI + Python</span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">RE</div>
            <div>
              <strong>Frontend</strong>
              <span>React + TypeScript</span>
            </div>
          </div>
        </section>

        <footer>
          Employee Salary Prediction System • AI Engineering
          Portfolio Project
        </footer>
      </main>
    </div>
  );
}

export default App;