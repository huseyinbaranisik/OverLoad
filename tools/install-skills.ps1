# Claude Code skill paketlerini tek seferde kurar (Windows PowerShell).
#
#   irm https://raw.githubusercontent.com/huseyinbaranisik/OverLoad/main/tools/install-skills.ps1 | iex
#
# Eksikse Claude Code, Git, Node.js, Bun ve uv'yi kendisi kurar (winget ile). ppt-master'ın python paketleri için pip gerekir.
# Biri başarısız olursa script durmaz, sonda hangilerinin kurulamadığını listeler.

$ok = @(); $fail = @()

function Step($name) { Write-Host "`n==> $name" -ForegroundColor Cyan }
function Have($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Run($name, [scriptblock]$block) {
  & $block
  if ($LASTEXITCODE -eq 0) { $script:ok += $name } else { $script:fail += $name }
}

# Yeni kurulan araçları bu pencerede de görebilmek için PATH'i yeniler.
function Refresh-Path {
  $env:Path = @(
    $env:Path,
    [Environment]::GetEnvironmentVariable('Path', 'Machine'),
    [Environment]::GetEnvironmentVariable('Path', 'User'),
    "$HOME\.local\bin", "$HOME\.bun\bin", "$env:ProgramFiles\Git\cmd", "$env:ProgramFiles\nodejs"
  ) -join ';'
}

function Winget($id) {
  if (-not (Have winget)) { Write-Host "winget yok, $id elle kurulmalı" -ForegroundColor Red; return }
  winget install --id $id -e --source winget --accept-package-agreements --accept-source-agreements
  Refresh-Path
}

# Claude Code plugin marketplace'i ekleyip plugini kullanıcı kapsamında kurar.
function Plugin($name, $repo, $id) {
  Step "$name  ($repo)"
  claude plugin marketplace add $repo *> $null
  Run $name { claude plugin install $id --scope user }
}

# skills CLI (vercel-labs/skills) ile ~/.claude/skills altına global kurulum.
# npx.ps1 betik engeline takılmasın diye npx.cmd çağrılır.
function Skills($name, $repo, [string[]]$extra = @()) {
  Step "$name  ($repo)"
  Run $name { npx.cmd -y skills@latest add $repo @extra -g -a claude-code -y }
}

# Eksik araçları kur: Claude Code, Git, Node.js, Bun, uv
Refresh-Path
if (-not (Have claude)) { Step "Claude Code kuruluyor"; powershell -NoProfile -ExecutionPolicy Bypass -c "irm https://claude.ai/install.ps1 | iex"; Refresh-Path }
if (-not (Have git))    { Step "Git kuruluyor";         Winget Git.Git }
if (-not (Have npx.cmd)) { Step "Node.js kuruluyor";    Winget OpenJS.NodeJS.LTS }
if (-not (Have bun))    { Step "Bun kuruluyor";         powershell -NoProfile -ExecutionPolicy Bypass -c "irm bun.sh/install.ps1 | iex"; Refresh-Path }
if (-not (Have uv))     { Step "uv kuruluyor";          Winget astral-sh.uv }

foreach ($c in 'claude', 'git', 'npx.cmd') {
  if (-not (Have $c)) { Write-Host "Hata: '$c' kurulamadı. Kurup bu komutu yeni bir pencerede tekrar çalıştır." -ForegroundColor Red; return }
}

# 1. satır: ponytail, karpathy, superpowers, ecc, Matt Pocock
Plugin "ponytail"        "DietrichGebert/ponytail"           "ponytail@ponytail"
Plugin "karpathy skills" "multica-ai/andrej-karpathy-skills" "andrej-karpathy-skills@karpathy-skills"
Plugin "superpowers"     "obra/superpowers-marketplace"      "superpowers@superpowers-marketplace"
Plugin "ecc"             "affaan-m/everything-claude-code"   "ecc@ecc"
Plugin "matt pocock"     "mattpocock/skills"                 "mattpocock-skills@mattpocock"

# agent skills (Addy Osmani plugini + Vercel skill paketi)
Plugin "agent skills (addyosmani)" "addyosmani/agent-skills"  "agent-skills@addy-agent-skills"
Skills "agent skills (vercel)"     "vercel-labs/agent-skills" @('--skill', '*')

# 2. satır: gstack, caveman, claude-mem, headroom, gsd, bmad
Step "gstack  (garrytan/gstack)"
$gstack = Join-Path $HOME ".claude/skills/gstack"
$gitBash = "$env:ProgramFiles\Git\bin\bash.exe"   # PATH'teki bash WSL'inki olabilir
if ((Have bun) -and (Test-Path $gitBash)) {
  if (Test-Path (Join-Path $gstack ".git")) {
    Run "gstack" { git -C $gstack pull --ff-only; if ($LASTEXITCODE -eq 0) { Push-Location $gstack; & $gitBash ./setup; Pop-Location } }
  } else {
    Run "gstack" { git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git $gstack; if ($LASTEXITCODE -eq 0) { Push-Location $gstack; & $gitBash ./setup; Pop-Location } }
  }
} else {
  Write-Host "bun veya Git Bash yok, gstack atlandı"
  $fail += "gstack (bun/bash yok)"
}

Plugin "caveman"    "JuliusBrussee/caveman" "caveman@caveman"
Plugin "claude-mem" "thedotmack/claude-mem" "claude-mem@thedotmack"

Step "headroom CLI  (headroom-ai)"
if (Have uv) { Run "headroom CLI" { uv tool install --python 3.13 "headroom-ai[all]" } }
elseif (Have pip) { Run "headroom CLI" { pip install --user "headroom-ai[all]" } }
else { Write-Host "uv/pip yok, headroom CLI atlandı"; $fail += "headroom CLI (python yok)" }
Plugin "headroom" "chopratejas/headroom" "headroom@headroom-marketplace"

Step "gsd  (get-shit-done-cc)"
Run "gsd" { npx.cmd -y get-shit-done-cc@latest --claude --global }

Skills "bmad method" "bmad-code-org/BMAD-METHOD" @('--skill', '*')

# 3. satır: UI UX pro max, taste, archify, diagram design, ppt master, impeccable
Plugin "ui ux pro max"  "nextlevelbuilder/ui-ux-pro-max-skill" "ui-ux-pro-max@ui-ux-pro-max-skill"
Plugin "taste"          "Leonxlnx/taste-skill"                 "taste-skill@taste-skill"
Skills "archify"        "tt-a1i/archify"
Plugin "diagram design" "cathrynlavery/diagram-design"         "diagram-design@diagram-design"
Plugin "ppt master"     "hugohe3/ppt-master"                   "ppt-master@ppt-master"
if (Have pip) {
  Run "ppt master (python paketleri)" { pip install --user -r https://raw.githubusercontent.com/hugohe3/ppt-master/HEAD/skills/ppt-master/requirements.txt }
}
Plugin "impeccable"     "pbakaus/impeccable"                   "impeccable@impeccable"

Write-Host "`nKuruldu ($($ok.Count)): $($ok -join ', ')" -ForegroundColor Green
if ($fail.Count) { Write-Host "Kurulamadı ($($fail.Count)): $($fail -join ', ')" -ForegroundColor Red }
Write-Host "`nClaude Code'u yeniden başlat. Headroom için bir kez: headroom deploy  (ya da: headroom wrap claude)"
