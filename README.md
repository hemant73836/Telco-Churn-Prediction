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
###------Model	Accuracy_Score	Precision_Score	Recall_Score	F1_Score	roc_auc_Score	Classification_report -------
        0	LogisticRegression	0.724947	0.489292	0.794118	0.605505	0.834019	precision    recall  f1-score   
        1	XGBoost	0.739872	0.506780	0.799465	0.620332	0.840133	precision    recall  f1-score   
        2	DecisionTree	0.722104	0.478149	0.497326	0.487549	0.650644	precision    recall  f1-score   
        3	KNeighborsClassifier	0.754087	0.535533	0.564171	0.549479	0.774895	precision    recall  f1-score   
        4	RandomForest	0.754087	0.531674	0.628342	0.575980	0.810621	precision    recall  f1-score  
        5	SVC	0.726368	0.490725	0.778075	0.601861	0.804444	precision    recall  f1-score   
        6	NaiveBias	0.679460	0.444444	0.823529	0.577320	0.804664	precision    recall  f1-score   

--> XGBoost giving good prediction as compare to other models , like accuracy - 70% , Recall - 80% amlost , Precision - 50%.

--> Then i do model tuning (Hyperparameter tuning) in XGBoost .
* Where the best parameters were :
'classifier__subsample': 1.0, 'classifier__scale_pos_weight': np.float64(2.762541806020067), 'classifier__n_estimators': 400, 'classifier__min_child_weight': 1, 'classifier__max_depth': 3, 'classifier__learning_rate': 0.01, 'classifier__colsample_bytree': 0.8}

#Then i got decent score :)


###  FastAPI & Pydantic workflow....
Genuinely speaking this is my first fastapi project and it takes everthing from me :( , but was happy afterall this is my first fastapi project. okay so, In main.py my all api and pydantic work are save, First i dump my model and store it in "model" and use pydantic to validate it(BaseModel) , i want to add more field but i cant't because of messy data. And yaa i use ai(Claude) to slove some error and also for more correction..

### FrontEnd and BackEnd
NGl i use claude ai to create FrontEnd and Backend , where in connection part to connect api to frontend i use FastAPI build_in class called FileResponse , basically it connect frontend to api thatsit.
This processes take more time because i didn't know frontend ..

Real Talk....
This is my first project before this i simply use streamlit , but in this project i use both fastapi , pydantic for val and front end, i know i use ai for most of the part but ngl i learns a lot from this project that how api works ,how to connect model to api and also how to connect api to frontend , and at last how to deploy application to render.... 

