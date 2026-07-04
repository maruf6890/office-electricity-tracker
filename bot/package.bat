@echo off

if "%1"=="i" (
    pip install -r requirements.txt
)
if "%1"=="env" (
   conda activate office-sim
)