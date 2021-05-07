https://cerulean.kkennib.com/294 참고

# 데스크톱 또는 노트북에서 에서 git pull 후 첫 빌드시 

cd %ANDROID_HOME%\platform-tools
adb uninstall com.example.camera

Success 확인 후 프로젝트 다시 빌드

# git 업뎃
git status
git add --all
git status
git commit -m "commit to ** at ** on **/**"
git push
