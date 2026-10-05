$git = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"

Write-Host "--- Git Init ---"
& $git init

Write-Host "--- Setting User Config ---"
& $git config user.name "vakasangam-ops"
& $git config user.email "vakasangam@example.com"

Write-Host "--- Git Add ---"
& $git add .

Write-Host "--- Git Status ---"
& $git status --short

Write-Host "--- Git Commit ---"
& $git commit -m "feat: complete Krishi Sahayak Smart Agriculture and Village Service Center Platform"

Write-Host "--- Rename Branch to main ---"
& $git branch -M main

Write-Host "--- Setting Remote Origin ---"
& $git remote remove origin 2>$null
& $git remote add origin https://github.com/vakasangam-ops/smart-agriculture-app.git

Write-Host "--- Git Remote -v ---"
& $git remote -v

Write-Host "--- Done local git setup ---"
