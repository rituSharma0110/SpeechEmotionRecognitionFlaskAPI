# from flask import Flask, request,render_template
# import random
# import tensorflow
from distutils.errors import UnknownFileError
from encodings.utf_8 import decode
from tensorflow.keras.models import load_model
# import numpy as np
# import librosa
# import pandas as pd
# from sklearn.preprocessing import OneHotEncoder
# import speech_recognition as sr
from flask import Flask, jsonify, render_template, request
# import random
import requests
import tensorflow
import csv
import os
import speech_recognition as sr
import numpy as np
import librosa 
import pandas as pd
from keras.models import load_model
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from keras import backend as K

# app = Flask(__name__, template_folder='template', static_folder='static')
# model=load_model(r'Emotion_Emergency.h5')



app = Flask(__name__, template_folder='template', static_folder='static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/audio/')
def audio_to_text():
    return render_template('audio.html')

@app.route('/predict',methods=['POST'])
def predict():

    def recall_m(y_true, y_pred):
        true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
        possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
        recall = true_positives / (possible_positives + K.epsilon())
        return recall

    def precision_m(y_true, y_pred):
        true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
        predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
        precision = true_positives / (predicted_positives + K.epsilon())
        return precision
    def f1_m(y_true, y_pred):
        precision = precision_m(y_true, y_pred)
        recall = recall_m(y_true, y_pred)
        return 2*((precision*recall)/(precision+recall+K.epsilon()))

    dependencies = {'f1_m': f1_m }
    # create a custom function to load model
    def load_all_models(n_models):
        all_models = list()
        for i in range(n_models):
            # Specify the filename 
            filename = 'Ensemble_Models\model'+ str(i + 1) + '.h5'
            # load the model 
            model = load_model(filename,custom_objects=dependencies)
            # Add a list of all the weaker learners
            all_models.append(model)
            print('>loaded %s' % filename)
        return all_models

    # create stacked model input dataset as outputs from the ensemble
    def stacked_dataset(members, inputX):
        stackX = None
        for model in members:
            # make prediction
            yhat = model.predict(inputX, verbose=0)
            # stack predictions into [rows, members, probabilities]
            if stackX is None:
                stackX = yhat #
            else:
                stackX = np.dstack((stackX, yhat))
        # flatten predictions to [rows, members x probabilities]
        stackX = stackX.reshape((stackX.shape[0], stackX.shape[1]*stackX.shape[2]))
        return stackX

    def fit_stacked_model(members, inputX, inputy):
        # create dataset using ensemble
        stackedX = stacked_dataset(members, inputX)
        # fit the meta learner
        model = LogisticRegression() #meta learner
        model.fit(stackedX, inputy)
        return model

    def stacked_prediction(members, model, inputX):
        # create dataset using ensemble
        stackedX = stacked_dataset(members, inputX)
        # make a prediction
        yhat = model.predict(stackedX)
        return yhat

    def noise(data):
        noise_amp = 0.035*np.random.uniform()*np.amax(data)
        data = data + noise_amp*np.random.normal(size=data.shape[0])
        return data

    def feat_ext(data):
        mfcc = np.mean(librosa.feature.mfcc(y=data, sr=22050).T, axis=0)
        return mfcc

    def get_feat(path):
        data, sample_rate = librosa.load(path, duration=5, offset=0.6)
        # normal data
        res1 = feat_ext(data)
        result = np.array(res1)
        #data with noise
        noise_data = noise(data)
        res2 = feat_ext(noise_data)
        result = np.vstack((result, res2))
        return result

    n_members = 4
    members = load_all_models(n_members)
    print('Loaded %d models' % len(members))

    with open('upload/audio.wav', 'wb') as f:
        f.write(request.data)
    try:
        r = sr.Recognizer()
        # open the file
        with sr.AudioFile('upload/audio.wav') as source:
        # listen for the data (load audio to memory)
            r.adjust_for_ambient_noise(source)
            audio_data = r.listen(source)
        # recognize (convert from speech to text)
            text = r.recognize_google(audio_data)
            print(text.casefold())
            speech_text= text.casefold()
    except sr.UnknownValueError:
        return str("Blank Call")

    Features = pd.read_csv(r'features_Emergency.csv')
    Y = Features['labels'].values
    encoder = OneHotEncoder()
    Y = encoder.fit_transform(np.array(Y).reshape(-1,1)).toarray()

    # with open('Words_emotion.csv', 'rb') as file:
    #     dataset = file.read()

    dataset = pd.read_csv(r'Words_emotion.csv', header=1, lineterminator='\n', sep=';', error_bad_lines=False, engine='python')
    # dataset = dataset.decode('ISO-8859-1', 'ignore')
    dataset.astype({'Phrases':'string', 'Emotions':'string'}).dtypes
    X = dataset['Phrases']
    y = dataset['Emotions']

    # splitting data
    x_train, x_test, y_train, y_test = train_test_split(X, Y,test_size=0.3, random_state=0, shuffle=True)
    
    x_traincnn =np.expand_dims(x_train, axis=2)
    x_testcnn= np.expand_dims(x_test, axis=2)
    x_traincnn.shape, y_train.shape, x_testcnn.shape, y_test.shape

    
    y_test = encoder.inverse_transform(y_test)

    model = fit_stacked_model(members,x_testcnn, y_test)	
    
    feature = get_feat('upload/audio.wav')
    test =np.expand_dims(feature, axis=2)
    livepreds = stacked_prediction(members, model, test)
    

    emotion_list=[]
    for i in range(len(X)):
        if X[i] in speech_text:
            emotion_list.append(y[i])  
    
    if emotion_list:
        count_angry=emotion_list.count("abusive")
        count_notprank=emotion_list.count("Not_Prank")
        count_prank=emotion_list.count("prank")
        total = count_prank+count_angry+count_notprank
        angry_percentage = count_angry/total*100
        prank_percentage = count_prank/total*100
        notprank_percentage = count_notprank/total*100
        count_list = [angry_percentage,notprank_percentage ,prank_percentage]
        for ind, i in enumerate(count_list):
            count_list[ind] = "{}%".format(i)
        result_list = ['Abusive','Not Prank','Prank']
        df = pd.DataFrame(zip(result_list,count_list))
    else:
        count_list = [0,0,0]
        for ind, i in enumerate(count_list):
            [ind] = "{}%".format(i)
        result_list = ['Abusive','Not Prank','Prank']
        df = pd.DataFrame(zip(result_list,count_list))

    final_df = df.sort_values(by=[0], ascending=False)
    final_list = str(final_df)

    return str(livepreds[0] + final_list.iloc[0,:] + final_list.iloc[1,:] + final_list.iloc[2,:]) 

if __name__ == "__main__":
    app.run(debug=True)