from flask import Flask, request, jsonify, render_template,flash
import random
import tensorflow
from tensorflow.keras.models import load_model
import numpy as np
import librosa
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
import speech_recognition as sr

app = Flask(__name__, template_folder='template', static_folder='static')
model=load_model(r'Emotion_Emergency.h5')

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/')
# def home():
#     return render_template('audio_to_text.html')

@app.route('/audio/')
def audio_to_text():
    return render_template('audio.html')

@app.route('/predict',methods=['POST'])
def predict():

    # r = sr.Recognizer()
    with open('upload/audio.wav', 'wb') as f:
        f.write(request.data)
  
   
    # get file from POST request and save it
    
    

    Features = pd.read_csv(r'features_Emergency.csv')
    Y = Features['labels'].values
    encoder = OneHotEncoder()
    Y = encoder.fit_transform(np.array(Y).reshape(-1,1)).toarray()
    
    # NOISE
    def noise(data):
        noise_amp = 0.035*np.random.uniform()*np.amax(data)
        data = data + noise_amp*np.random.normal(size=data.shape[0])
        return data
    # # STRETCH
    # def stretch(data, rate=0.8):
    #     return librosa.effects.time_stretch(data, rate)
    # # PITCH
    # def pitch(data, sampling_rate, pitch_factor=0.7):
    #     return librosa.effects.pitch_shift(data, sampling_rate, pitch_factor)

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

    feature = get_feat('upload/audio.wav')
    test =np.expand_dims(feature, axis=2)
    livepreds = model.predict(test)
    livepredictions = (encoder.inverse_transform((livepreds)))

    return str(livepredictions[0])
    # return render_template('audio_to_text.html', prediction_text='OUTPUT IS {}'.format(livepredictions[0],'upload/audio.wav'))

if __name__ == "__main__":
    app.run(debug=True)