# Script de génération de trafic pour TaskWatch API
# Génère des logs pour l'analyse Grafana

Write-Host "=== Génération de trafic TaskWatch API ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$token = ""

# ============================================
# 1. LOGIN - Récupération du token
# ============================================
Write-Host "[1/7] POST /auth/login - Authentification..." -ForegroundColor Yellow

for ($i=1; $i -le 20; $i++) {
  try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}' -ErrorAction Stop
    $token = $response.user.id.ToString()
    Write-Host "  Login $i : Success (user ID: $token)" -ForegroundColor Green
  } catch {
    Write-Host "  Login $i : Error ($_)" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 300
}

if (-not $token) {
  Write-Host "`nErreur : Impossible d'obtenir un token. Vérifiez que le backend est démarré." -ForegroundColor Red
  exit 1
}

Write-Host "`nToken (User ID) obtenu : $token" -ForegroundColor Green
Write-Host ""

# ============================================
# 2. POST /tasks - Création de tâches
# ============================================
Write-Host "[2/7] POST /tasks - Création de tâches..." -ForegroundColor Yellow

$taskNames = @(
  "Implémenter le nouveau dashboard",
  "Corriger le bug de connexion",
  "Mettre à jour la documentation",
  "Optimiser les requêtes SQL",
  "Ajouter des tests unitaires",
  "Refactorer le code legacy",
  "Déployer en production",
  "Review du code",
  "Meeting avec l'équipe",
  "Analyser les logs Grafana"
)

$createdTaskIds = @()

for ($i=1; $i -le 30; $i++) {
  try {
    $randomName = $taskNames | Get-Random
    $randomDescription = "Description de la tâche $i - Générée automatiquement pour les tests"
    
    $body = @{
      name = $randomName
      description = $randomDescription
    } | ConvertTo-Json
    
    $task = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body -ErrorAction Stop
    $createdTaskIds += $task.id
    Write-Host "  POST /tasks $i : Success (ID: $($task.id))" -ForegroundColor Green
  } catch {
    Write-Host "  POST /tasks $i : Error ($_)" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 400
}

Write-Host ""

# ============================================
# 3. GET /tasks - Récupération des tâches
# ============================================
Write-Host "[3/7] GET /tasks - Récupération des tâches..." -ForegroundColor Yellow

for ($i=1; $i -le 50; $i++) {
  try {
    $tasks = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method GET -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "  GET /tasks $i : Success ($($tasks.Count) tâches)" -ForegroundColor Green
  } catch {
    Write-Host "  GET /tasks $i : Error" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 200
}

Write-Host ""

# ============================================
# 4. PATCH /tasks/:id/status - Changement de statut
# ============================================
Write-Host "[4/7] PATCH /tasks/:id/status - Changement de statut..." -ForegroundColor Yellow

$statuses = @("todo", "in_progress", "done")

if ($createdTaskIds.Count -gt 0) {
  for ($i=1; $i -le 40; $i++) {
    try {
      $randomTaskId = $createdTaskIds | Get-Random
      $randomStatus = $statuses | Get-Random
      
      $body = @{
        status = $randomStatus
      } | ConvertTo-Json
      
      Invoke-RestMethod -Uri "$baseUrl/tasks/$randomTaskId/status" -Method PATCH -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body -ErrorAction Stop | Out-Null
      Write-Host "  PATCH /tasks/$randomTaskId/status $i : Success (status: $randomStatus)" -ForegroundColor Green
    } catch {
      Write-Host "  PATCH /tasks/:id/status $i : Error ($_)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 350
  }
} else {
  Write-Host "  Aucune tâche créée, impossible de changer les statuts" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 5. POST /tasks/:id/start - Démarrage du timer
# ============================================
Write-Host "[5/7] POST /tasks/:id/start - Démarrage des timers..." -ForegroundColor Yellow

if ($createdTaskIds.Count -gt 0) {
  for ($i=1; $i -le 25; $i++) {
    try {
      $randomTaskId = $createdTaskIds | Get-Random
      
      Invoke-RestMethod -Uri "$baseUrl/tasks/$randomTaskId/start" -Method POST -Headers @{Authorization="Bearer $token"} -ErrorAction Stop | Out-Null
      Write-Host "  POST /tasks/$randomTaskId/start $i : Success" -ForegroundColor Green
    } catch {
      Write-Host "  POST /tasks/:id/start $i : Error (peut-être déjà démarré)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 450
  }
} else {
  Write-Host "  Aucune tâche créée, impossible de démarrer les timers" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 6. POST /tasks/:id/stop - Arrêt du timer
# ============================================
Write-Host "[6/7] POST /tasks/:id/stop - Arrêt des timers..." -ForegroundColor Yellow

if ($createdTaskIds.Count -gt 0) {
  for ($i=1; $i -le 25; $i++) {
    try {
      $randomTaskId = $createdTaskIds | Get-Random
      
      Invoke-RestMethod -Uri "$baseUrl/tasks/$randomTaskId/stop" -Method POST -Headers @{Authorization="Bearer $token"} -ErrorAction Stop | Out-Null
      Write-Host "  POST /tasks/$randomTaskId/stop $i : Success" -ForegroundColor Green
    } catch {
      Write-Host "  POST /tasks/:id/stop $i : Error (peut-être pas démarré)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 450
  }
} else {
  Write-Host "  Aucune tâche créée, impossible d'arrêter les timers" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 7. GET /dashboard/summary - Récupération du résumé
# ============================================
Write-Host "[7/7] GET /dashboard/summary - Récupération du dashboard..." -ForegroundColor Yellow

for ($i=1; $i -le 30; $i++) {
  try {
    $summary = Invoke-RestMethod -Uri "$baseUrl/dashboard/summary" -Method GET -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "  GET /dashboard/summary $i : Success" -ForegroundColor Green
  } catch {
    Write-Host "  GET /dashboard/summary $i : Error" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "=== Génération de trafic terminée ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Statistiques générées :" -ForegroundColor White
Write-Host "  - POST /auth/login       : ~20 requêtes" -ForegroundColor Gray
Write-Host "  - GET /tasks             : ~50 requêtes" -ForegroundColor Gray
Write-Host "  - POST /tasks            : ~30 requêtes" -ForegroundColor Gray
Write-Host "  - PATCH /tasks/:id/status: ~40 requêtes" -ForegroundColor Gray
Write-Host "  - POST /tasks/:id/start  : ~25 requêtes" -ForegroundColor Gray
Write-Host "  - POST /tasks/:id/stop   : ~25 requêtes" -ForegroundColor Gray
Write-Host "  - GET /dashboard/summary : ~30 requêtes" -ForegroundColor Gray
Write-Host ""
Write-Host "Total : ~220 requêtes enregistrées dans request_logs" -ForegroundColor Green
Write-Host ""
Write-Host "Vérifiez maintenant vos dashboards Grafana !" -ForegroundColor Cyan
Write-Host "  - TaskWatch API - Overview" -ForegroundColor White
Write-Host "  - TaskWatch API - Tasks Detailed" -ForegroundColor White
