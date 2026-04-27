@echo off
setlocal

set CERT_FILE=certificate.crt
set KEY_FILE=private.key
set DAYS_VALID=365
set PORT=8443
set OPENSSL_SUBJ=/C=FR/ST=IDF/L=Paris/O=MonEntreprise/OU=IT/CN=localhost

REM -------------------------
REM Debug optionnel
REM -------------------------
REM echo [DEBUG] PATH=%PATH%
REM echo.

REM -------------------------
REM 1) Verifier OpenSSL
REM -------------------------
where.exe openssl >nul 2>nul
if errorlevel 1 (
    echo OpenSSL non trouve.

    REM Tester Chocolatey de facon plus fiable
    call choco --version >nul 2>nul
    if errorlevel 1 (
        echo Chocolatey non trouve.
        echo Demarrage en HTTP sur le port %PORT%.
        goto START_HTTP
    )

    echo Chocolatey detecte.
    echo Installation de OpenSSL via Chocolatey...
    call choco install openssl -y

    REM Re-verifier OpenSSL apres installation
    where.exe openssl >nul 2>nul
    if errorlevel 1 (
        echo OpenSSL toujours indisponible apres installation.
        echo Demarrage en HTTP sur le port %PORT%.
        goto START_HTTP
    )
)

echo OpenSSL est disponible.

REM -------------------------
REM 2) Verifier certificat
REM -------------------------
if exist "%CERT_FILE%" if exist "%KEY_FILE%" (
    echo Verification du certificat...
    openssl x509 -checkend 0 -noout -in "%CERT_FILE%" >nul 2>nul
    if not errorlevel 1 (
        echo Certificat valide.
        goto START_HTTPS
    )
)

echo Generation d'un nouveau certificat...

if exist "%CERT_FILE%" del /f /q "%CERT_FILE%"
if exist "%KEY_FILE%" del /f /q "%KEY_FILE%"

openssl req -x509 -newkey rsa:2048 -keyout "%KEY_FILE%" -out "%CERT_FILE%" -days %DAYS_VALID% -nodes -subj "%OPENSSL_SUBJ%"
if errorlevel 1 (
    echo Echec de la generation du certificat.
    echo Demarrage en HTTP sur le port %PORT%.
    goto START_HTTP
)

:START_HTTPS
echo Lancement HTTPS sur https://localhost:%PORT%
uvicorn app.main:app --reload --port %PORT% --ssl-keyfile "%KEY_FILE%" --ssl-certfile "%CERT_FILE%"
goto END

:START_HTTP
echo Lancement HTTP sur http://localhost:%PORT%
uvicorn app.main:app --reload --port %PORT%

:END
endlocal