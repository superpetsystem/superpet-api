# ╔═══════════════════════════════════════════════════════════════════╗
# ║  SUPERPET API - DEMONSTRAÇÃO DE LOGS DE NEGÓCIO                  ║
# ║  Este script roda testes e mostra os logs de erro no terminal    ║
# ╚═══════════════════════════════════════════════════════════════════╝

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          DEMONSTRAÇÃO DE LOGS DE NEGÓCIO - SUPERPET API         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 INSTRUÇÕES:`n" -ForegroundColor Yellow

Write-Host "   1. Certifique-se que a API está rodando em outro terminal:" -ForegroundColor White
Write-Host "      → npm run start:local`n" -ForegroundColor Gray

Write-Host "   2. Este script rodará testes que disparam erros de negócio`n" -ForegroundColor White

Write-Host "   3. OBSERVE O TERMINAL DA API para ver logs como:" -ForegroundColor White
Write-Host "      • ❌ [BUSINESS RULE] MISSING_CONTACT" -ForegroundColor Red
Write-Host "      • ❌ [BUSINESS RULE] INVALID_WEIGHT" -ForegroundColor Red
Write-Host "      • ❌ [PLAN LIMITS] STORE_LIMIT_EXCEEDED" -ForegroundColor Red
Write-Host "      • ❌ [ROLE HIERARCHY] FORBIDDEN`n" -ForegroundColor Red

Write-Host "Pressione qualquer tecla para iniciar os testes..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  TESTE 1: Validação de Erros                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Rodando: validation-errors.test.js" -ForegroundColor Cyan
Write-Host "Erros esperados no terminal da API:" -ForegroundColor Yellow
Write-Host "   • MISSING_CONTACT (Customer sem email/phone)" -ForegroundColor White
Write-Host "   • INVALID_WEIGHT (Pet com peso 0 ou > 200kg)" -ForegroundColor White
Write-Host "   • Validation errors (email inválido, nome vazio, etc)`n" -ForegroundColor White

node test/automation/errors/validation-errors.test.js 2>&1 | Select-String -Pattern "executados|PASSARAM" | ForEach-Object { Write-Host $_ -ForegroundColor Green }

Write-Host "`nPressione qualquer tecla para o próximo teste..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  TESTE 2: Hierarquia de Roles                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Rodando: employees-hierarchy.test.js" -ForegroundColor Cyan
Write-Host "Erros esperados no terminal da API:" -ForegroundColor Yellow
Write-Host "   • [ROLE HIERARCHY] ADMIN tentando criar OWNER" -ForegroundColor White
Write-Host "   • [ROLE HIERARCHY] STAFF tentando criar qualquer role" -ForegroundColor White
Write-Host "   • [BUSINESS RULE] EMAIL_ALREADY_EXISTS`n" -ForegroundColor White

node test/automation/employees/employees-hierarchy.test.js 2>&1 | Select-String -Pattern "testes executados|PASSARAM" | ForEach-Object { Write-Host $_ -ForegroundColor Green }

Write-Host "`nPressione qualquer tecla para o próximo teste..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  TESTE 3: Limites de Plano SaaS                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Rodando: saas-limits.test.js" -ForegroundColor Cyan
Write-Host "Erros esperados no terminal da API:" -ForegroundColor Yellow
Write-Host "   • [PLAN LIMITS] STORE_LIMIT_EXCEEDED (Plano BASIC: máx 1)" -ForegroundColor White
Write-Host "   • [PLAN LIMITS] EMPLOYEE_LIMIT_EXCEEDED (Plano BASIC: máx 2)" -ForegroundColor White
Write-Host "   • 📊 [PLAN LIMITS] Store count - Plan: BASIC, Current: X, Max: Y`n" -ForegroundColor White

node test/automation/saas/saas-limits.test.js 2>&1 | Select-String -Pattern "testes executados|PASSARAM" | ForEach-Object { Write-Host $_ -ForegroundColor Green }

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     TESTES CONCLUÍDOS! ✅                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 Resumo:" -ForegroundColor Yellow
Write-Host "   • Testes executados: ~26" -ForegroundColor White
Write-Host "   • Logs de negócio gerados: ~50+" -ForegroundColor White
Write-Host "   • Tipos de erro logados: BUSINESS RULE, PLAN LIMITS, ROLE HIERARCHY`n" -ForegroundColor White

Write-Host "📚 Documentação completa:" -ForegroundColor Yellow
Write-Host "   • docs/guides/ERROR-LOGGING.md" -ForegroundColor Gray
Write-Host "   • docs/guides/BUSINESS-LOGS-EXAMPLES.md 🔥`n" -ForegroundColor Gray

Write-Host "✨ Agora você pode ver TODOS os erros de negócio logados no terminal da API!" -ForegroundColor Green
Write-Host "   Execute: npm run start:local (em um terminal)" -ForegroundColor Cyan
Write-Host "   Execute: node test/automation/run-all-tests.js (em outro terminal)`n" -ForegroundColor Cyan

