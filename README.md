# SpeechEmotionRecognitionFlaskAPI
Abstract/Summary:
><b>Context</b>: The Government of India launched a pan-India service of the single emergency helpline number '112' for immediate assistance from police, fire, health and women departments. But pranks and fake calls have emerged as a matter of concern for the emergency service providers as these calls lead to queues and delays in assigning and providing the services. Such prank calls can even cost some victims their life. For example, if an ambulance is away attending a hoax call, it may cause a delay in reaching a genuine case.

><b>Objective</b>: Implement a solution that identifies the affective state of the caller calling at the emergency response system so that genuine callers can access the emergency services on time.

><b>Solution</b>: To build a machine learning model that can analyse the caller's voice and categorise it into one of the following classes: Angry/Stressful/ Prank/ Abusive/ Painful/ Drunk so that the prank calls are recognized and differentiated from the genuine ones. Also, perform speech-to-text conversion to get information about the gravity of the situation.

><b>Implication</b>: Every call is analysed for speech-emotion and text composition so that the authentic and legitimate calls are received and attended to, which could get ignored as a prank or fake. The efficiency of the services at the Emergency Response System is improved as the processes are escalated faster, with fewer prank calls.

Youtube Link:
>https://youtu.be/jpTKR7o3BpE

## Workflow
<img src="https://user-images.githubusercontent.com/86526643/191822953-c0a2000c-b3cf-419c-b9c0-cee4e291a60d.png" width="600" height="300" />

## 1. Making of the Dataset

We asked 18 speakers to record their audios in four emotions - angry, drunk, painful and stressful .

The audio files are labelled as follows:

EmotionNumber_ SentenceNumber_Gender _Synthetic/Natural_SpeakerNumber

01_01_01_01_01


The 4 sentences provided are as per the following indices:
>01 – We need an ambulance as soon as possible.

>02 – Someone has been lying dead on the street.

>03 – A neighbour of mine is shot dead.

>04 – This place is on fire. Please send help. 


The emotions have the following indices:

>01-  Angry

>02-  Drunk

>03-  Painful

>04-  Stressful


Gender is labelled as:

>01-  Female

>02-  Male


Type of audio is labelled as : 

>01-  Natural

>02-  Synthetic

The audios are saved in .wav format.

After labelling, the audio files were cleaned to remove background noise.

The files were then clipped to keep all of them to the same length(3 sec approx).

Synthetic files were created from audio files of 4 speakers by changing the pitch.

## Steps Involved

> Data Preprocessing

> Data Augmentation

<img src="https://user-images.githubusercontent.com/86526643/191824050-40512fdd-2620-4230-93dc-c217567841b6.png" width="600" height="300" />

> Feature Extraction

> Removing the outliers

> Encoding and splitting the dataset

> Training the CNN Model

<img src="https://user-images.githubusercontent.com/86526643/191824531-f9879c88-ccbe-41d1-b367-5f330755fdb1.png" width="600" height="250" />

> Model Evaluation

<img src="https://user-images.githubusercontent.com/86526643/191824396-ab4e28df-b1f7-4324-80db-5535f8bc5a8f.png" width="350" height="350" />

## User Interface

<img src="https://user-images.githubusercontent.com/86526643/191823749-70a45102-40e1-4e45-8d76-782224f8c20c.png" width="400" height="200" />
<img src="https://user-images.githubusercontent.com/86526643/191824709-b0e04127-820a-41c8-8453-796af5f6533a.png" width="400" height="200" />
<img src="https://user-images.githubusercontent.com/86526643/191824777-16b4585a-6f65-4de0-aeb5-ca4301f50537.png" width="400" height="200" />
<img src="https://user-images.githubusercontent.com/86526643/191824846-e65c9223-48bf-4aef-be30-d3e0771a11ec.png" width="400" height="200" />

### Technology Stack

> Python

> HTML

> CSS

> Flask

> Javascript

> MySQL






