@echo off
if [%1]==[] goto :eof
set n=0
:loop
if %n%==0 (
    truepng -fe -md remove all %1 -out crushed.png
) else (
    truepng -fe -md remove all %1 -out crushed^(%n%^).png
)
shift
set /a n+=1
if not [%1]==[] goto loop