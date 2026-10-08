@echo off
set "PATH=C:\laragon\bin\php\php-8.5.11-Win32-vs17-x64;%PATH%"
echo [RBI] Starting Laravel Server on port 8080 using PHP 8.5...
php artisan serve --port=8080
