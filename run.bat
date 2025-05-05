@echo off
rem Activate virtual environment
call .venv\scripts\activate

rem Navigate to the Application folder
cd Application

rem Start the backend server with uvicorn
start uvicorn backend:app --port 8000

rem Navigate to the app folder
cd app

rem Start the frontend server with npm
start npm start