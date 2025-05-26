@echo off
echo Creating a recovery branch...
git checkout -b recovery-branch

echo Checking out your merged branch...
git checkout final-combined-branch

echo Creating a branch for final combined changes...
git checkout -b final-combined-changes

echo Done! Now you need to manually cherry-pick the specific changes you want to keep.
echo Use the following commands as a guide:
echo.
echo git checkout your-recent-changes -- path/to/file/you/want/to/keep
echo.
echo For example:
echo git checkout your-recent-changes -- src/lib/client-api.ts
echo.
echo Then commit your changes:
echo git add .
echo git commit -m "Recovered specific changes from previous work"
pause 