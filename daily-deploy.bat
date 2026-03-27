@echo off
:: Deploy diário Zen Caps Blog - publica artigos agendados
:: Roda todo dia às 06:00 via Windows Task Scheduler

cd /d "C:\Users\bruno\Documents\Zen Caps\zen-caps-blog"

echo [%date% %time%] Iniciando deploy diario Zen Caps Blog... >> deploy-log.txt

npx vercel deploy --prod --token vca_6843rGlXPhDbAnPi6l6XJUFtfD1ZR5rVyxFe9Hiovfwx7TJRMf4QHxPT --yes >> deploy-log.txt 2>&1

if %errorlevel% == 0 (
    echo [%date% %time%] Deploy concluido com sucesso! >> deploy-log.txt
) else (
    echo [%date% %time%] ERRO no deploy - codigo: %errorlevel% >> deploy-log.txt
)
