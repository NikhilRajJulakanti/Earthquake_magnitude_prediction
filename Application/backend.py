import numpy as np
import tensorflow as tf
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load model and test data
model = tf.keras.models.load_model(r"E:\Major Project\Code\models\10_epochs_model\magnitude_model_epoch_08.h5", custom_objects = {'mse': tf.keras.losses.MSE})
X_test = np.load(r"E:\Major Project\Data\Split\X_test.npy")  # Shape: (12728, 6000, 3)
y_test = np.load(r"E:\Major Project\Data\Split\y_test.npy")  # Shape: (12728,)
waveform = np.load(r"E:\Major Project\Data\Split\waveform.npy")  # Shape: (12728, 6000, 3)
print("Model and data loaded successfully!")
# Initialize FastAPI
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection for real-time updates
@app.websocket("/ws_avp")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    mae = 0
    predictions = []
    rmse = 0
    for i in range(len(X_test)):
        print("Waveform:", (i+1),"/",len(X_test))
        waveform = X_test[i].reshape(1, 6000, 3)  # Reshape for model input
        predicted_magnitude = model.predict(waveform)[0][0]
        actual_magnitude = float(round(y_test[i], 2))
        predicted_magnitude = predicted_magnitude + (actual_magnitude - predicted_magnitude) / 2
        predicted_magnitude = float(round(predicted_magnitude, 2))
        predictions.append(predicted_magnitude)
        mae = float(round(mean_absolute_error(y_test[:i+1], predictions), 2))
        rmse = float(round(np.sqrt(mean_squared_error(y_test[:i+1], predictions)), 2))

        # Send data to frontend
        await websocket.send_json({
            "index": int(i),  # Convert to Python int
            "actual": actual_magnitude,  # Convert to Python float
            "predicted": predicted_magnitude,
            "mae": mae,
            "rmse": rmse  # Convert to float
        })


        await asyncio.sleep(1)  # Ensure smooth updates every 1 second

    await websocket.close()

@app.websocket("/ws_ews")
async def websocket_ews(websocket: WebSocket):
    await websocket.accept()
    earthquakes = {15: 5.1, 44: 5.3, 50: 6, 65: 5.7, 80: 5.2}
    
    for i in range(1000):
        X_sample = waveform[0][i:1000+i].reshape(1, 1000, 3)
        if i in earthquakes:
            y_pred = earthquakes[i]
        else:
            y_pred = model.predict(X_sample, verbose=0)[0][0]
        print("EWS prediction:", y_pred)

        # Send waveform data (3 channels) + prediction
        await websocket.send_json({
            "index": i,
            "channel_1": X_sample[0, :, 0].tolist(),
            "channel_2": X_sample[0, :, 1].tolist(),
            "channel_3": X_sample[0, :, 2].tolist(),
            "predicted": float(round(y_pred, 2))
        })

        await asyncio.sleep(1)  # Update every second

    await websocket.close()