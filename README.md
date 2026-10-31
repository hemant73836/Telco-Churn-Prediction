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

*Then i got decent score :)


###  FastAPI & Pydantic workflow....
Genuinely speaking this is my first fastapi project and it takes everthing from me :( , but was happy afterall this is my first fastapi project. okay so, In main.py my all api and pydantic work are save, First i dump my model and store it in "model" and use pydantic to validate it(BaseModel) , i want to add more field but i cant't because of messy data. And yaa i use ai(Claude) to slove some error and also for more correction..

### FrontEnd and BackEnd
NGl i use claude ai to create FrontEnd and Backend , where in connection part to connect api to frontend i use FastAPI build_in class called FileResponse , basically it connect frontend to api thatsit.
This processes take more time because i didn't know frontend ..

###Real Talk....
This is my first project before this i simply use streamlit , but in this project i use both fastapi , pydantic for val and front end, i know i use ai for most of the part but ngl i learns a lot from this project that how api works ,how to connect model to api and also how to connect api to frontend , and at last how to deploy application to render.... 

