# Telco-Churn-Prediction APP ;)

This is a full stack Machine Learning Model(Application) that can predict whether a telecom customer is likely to churn or not.

LIVE DEMO ----> https://telco-churn-prediction-yba4.onrender.com/


##  Tech Stack & Architecture Stuff

- **Backend:** Python, FastAPI, Uvicorn, Pydantic (for request validation)
- **Machine Learning:** Scikit-learn (Pipeline & ColumnTransformer), XGBoost Classifier, Joblib (`Churn_model2.pkl`)
- **Frontend:** HTML5, Modern CSS (Signal meter design, responsive grid), Vanilla JavaScript (`script.js`)
- **Deployment:** Render Cloud Platform

## What i face during the production from Data Cleaning to deployment ??
* So, i get dataset from kaggel (telco_churn_prediction) and then i do data preprocessing , EDA , Feature engineering etc.
* Then i create multiple pipelines for each model , some model needs standard scaler and other doesn't so i create to different pipelines for each model and fit according to it.
* Then i do prediction after all this stuff and guess what, i got good prediction in XGBoost model ..
## 📊 Model Performance Comparison

Here is the comparative evaluation of various machine learning models trained for **Telco Churn Prediction**:

| Model | Accuracy Score | Precision Score | Recall Score | F1 Score | ROC AUC Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 0.7249 | 0.4893 | 0.7941 | 0.6055 | 0.8340 |
| **XGBoost** | 0.7399 | 0.5068 | 0.7995 | 0.6203 | **0.8401** |
| **Decision Tree** | 0.7221 | 0.4781 | 0.4973 | 0.4875 | 0.6506 |
| **K-Neighbors Classifier** | **0.7541** | **0.5355** | 0.5642 | 0.5495 | 0.7749 |
| **Random Forest** | **0.7541** | 0.5317 | 0.6283 | 0.5760 | 0.8106 |
| **SVC** | 0.7264 | 0.4907 | 0.7781 | 0.6019 | 0.8044 |
| **Naive Bayes** | 0.6795 | 0.4444 | **0.8235** | 0.5773 | 0.8047 |

---

### 🔑 Key Takeaways
* **Highest ROC AUC & F1 Score:** `XGBoost` performed best overall in capturing positive churn instances with balanced precision and recall.
* **Highest Recall:** `Naive Bayes` achieved the highest recall ($0.8235$), making it sensitive to capturing churning customers, though with lower precision.
* **Highest Accuracy:** `K-Neighbors Classifier` and `Random Forest` achieved the highest raw accuracy ($0.7541$).
--> XGBoost giving good prediction as compare to other models , like accuracy - 70% , Recall - 80% amlost , Precision - 50%.

--> Then i do model tuning (Hyperparameter tuning) in XGBoost .
* Where the best parameters were :
'classifier__subsample': 1.0,
 'classifier__scale_pos_weight': np.float64(2.762541806020067),
 'classifier__n_estimators': 400,
'classifier__min_child_weight': 1,
'classifier__max_depth': 3,
 'classifier__learning_rate': 0.01,
'classifier__colsample_bytree': 0.8}

* Then i got decent score :)


###  FastAPI & Pydantic workflow....
Genuinely speaking this is my first fastapi project and it takes everthing from me :( , but was happy afterall this is my first fastapi project. okay so, In main.py my all api and pydantic work are save, First i dump my model and store it in "model" and use pydantic to validate it(BaseModel) , i want to add more field but i cant't because of messy data. And yaa i use ai(Claude) to slove some error and also for more correction..

### FrontEnd and BackEnd
NGl i use claude ai to create FrontEnd and Backend , where in connection part to connect api to frontend i use FastAPI build_in class called FileResponse , basically it connect frontend to api thatsit.
This processes take more time because i didn't know frontend ..

### Real Talk ...
This is my first project before this i simply use streamlit , but in this project i use both fastapi , pydantic for val and front end, i know i use ai for most of the part but ngl i learns a lot from this project that how api works ,how to connect model to api and also how to connect api to frontend , and at last how to deploy application to render.... 

#### Here Is All In Depth Details About This Project

## What it does

You enter a customer's profile, services and billing details. The model returns:

- a **yes/no prediction** (will this customer churn?)
- the **churn probability** and the **chance of staying**

The frontend shows the result as a signal-strength meter. The more bars light up, the higher the churn risk, and a badge shows the risk level.

| Churn probability | Risk level |
|---|---|
| below 25% | Low |
| 25% to 50% | Moderate |
| 50% and above | High |

## How it works

```
Browser (HTML, CSS, JavaScript)
        |
        |  POST /predict  (JSON)
        v
FastAPI  ->  scikit-learn Pipeline (preprocessing + XGBoost classifier)
        |
        |  { prediction, churn_probability, no_churn_probability }
        v
Browser shows the result
```

## Features

**Frontend**
- Form for all 19 model inputs, with sensible defaults
- Related options lock together automatically. Choosing "None" for internet service sets every internet add-on to "No internet service", and choosing "No" for phone service sets multiple lines to "No phone service"
- Total charges are calculated from tenure and monthly charges, or can be entered manually
- Two example customers (a new month-to-month customer and a two-year loyal customer) to try quickly
- Live API status, an editable API address, and clear messages for offline, timeout and validation errors
- Animated result meter, keyboard-friendly controls, reduced-motion support, and a layout that works on mobile

**Backend**
- Input validation with Pydantic (allowed values, tenure 0 to 72, charges of 0 or more)
- CORS enabled so the browser frontend can call it
- Interactive API docs at `/docs`

## Tech stack

| Part | Tools |
|---|---|
| Model | scikit-learn Pipeline with XGBoost, saved with joblib |
| Backend | Python, FastAPI, Uvicorn, Pydantic, pandas |
| Frontend | HTML, CSS, JavaScript (no framework), Google Fonts |
| Hosting | Render (API), static hosting for the frontend |

## API reference

### `POST /predict`

Send all fields below as JSON.

| Field | Type | Allowed values |
|---|---|---|
| `gender` | string | `Female`, `Male` |
| `SeniorCitizen` | string | `Yes`, `No` |
| `Partner` | string | `Yes`, `No` |
| `Dependents` | string | `Yes`, `No` |
| `tenure` | integer | 0 to 72 (months) |
| `PhoneService` | string | `Yes`, `No` |
| `MultipleLines` | string | `Yes`, `No`, `No phone service` |
| `InternetService` | string | `DSL`, `Fiber optic`, `No` |
| `OnlineSecurity` | string | `Yes`, `No`, `No internet service` |
| `OnlineBackup` | string | `Yes`, `No`, `No internet service` |
| `DeviceProtection` | string | `Yes`, `No`, `No internet service` |
| `TechSupport` | string | `Yes`, `No`, `No internet service` |
| `StreamingTV` | string | `Yes`, `No`, `No internet service` |
| `StreamingMovies` | string | `Yes`, `No`, `No internet service` |
| `Contract` | string | `Month-to-month`, `One year`, `Two year` |
| `PaperlessBilling` | string | `Yes`, `No` |
| `PaymentMethod` | string | `Electronic check`, `Mailed check`, `Bank transfer (automatic)`, `Credit card (automatic)` |
| `MonthlyCharges` | number | 0 or more |
| `TotalCharges` | number | 0 or more |

**Example request**

```bash
curl -X POST https://telco-churn-prediction-yba4.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Female",
    "SeniorCitizen": "No",
    "Partner": "No",
    "Dependents": "No",
    "tenure": 2,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 70.7,
    "TotalCharges": 141.4
  }'
```

**Example response**

```json
{
  "prediction": "Yes",
  "churn_probability": 0.8332,
  "no_churn_probability": 0.1668
}
```

`prediction` is `"Yes"` when the model expects the customer to churn. If a value is missing or not allowed, the API returns `422` with details about the field.

## Run it locally

You need Python 3 (tested on 3.13 and 3.14).

**1. Start the API**

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

`Churn_model2.pkl` must be in the same folder as `main.py`. Open http://127.0.0.1:8000/docs to test it.

**2. Open the frontend**

Open `index.html` in your browser, or serve the folder:

```bash
python -m http.server 5500
```

Then set the API address to `http://127.0.0.1:8000`, either in the **API address** box on the page or by changing `DEFAULT_API_BASE` at the top of `script.js`. The box saves its value in your browser, and a saved value takes priority over `DEFAULT_API_BASE`.

## Project structure

```
.
├── main.py              FastAPI app: validation, model loading, /predict
├── Churn_model2.pkl     Trained pipeline (preprocessing + XGBoost)
├── requirements.txt     Python dependencies
├── index.html           Frontend page
├── style.css            Frontend styles
└── script.js            Frontend logic and API connection
```

## Deployment

**API on Render**

| Setting | Value |
|---|---|
| Language | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Environment variable | `PYTHON_VERSION` set to the version you develop with |

**Frontend**

Set `DEFAULT_API_BASE` in `script.js` to the Render URL, then publish `index.html`, `style.css` and `script.js` on any static host (for example GitHub Pages).

### Troubleshooting

- **`ModuleNotFoundError: No module named 'pyarrow'` (or `xgboost`) on startup.** The saved model needs these packages to load. Make sure both are in `requirements.txt`.
- **Warnings or odd results after changing library versions.** The model file was saved with specific scikit-learn and XGBoost versions. Keep the deployed versions the same as the ones used for training, ideally pinned with `==`.
- **Frontend says "API offline".** Check the API address, make sure the server is running, and give a sleeping free-tier server about a minute to wake up.

## Notes

- This is a learning project built on telecom customer churn data. The output is a statistical estimate, not a guarantee about any individual customer.
- Example inputs in the frontend are illustrative, not real customers.

## Author

Built by Hemant. GitHub: [hemant73836](https://github.com/hemant73836)
