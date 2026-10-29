# Claude Code skill paketlerini tek seferde kurar (Windows PowerShell).
#
#   irm https://raw.githubusercontent.com/huseyinbaranisik/OverLoad/main/tools/install-skills.ps1 | iex
#
# Gerekenler: claude (Claude Code CLI), git, node/npx. gstack için bun + Git Bash, headroom ve ppt-master için python.
# Biri başarısız olursa script durmaz, sonda hangilerinin kurulamadığını listeler.

$ok = @(); $fail = @()

function Step($name) { Write-Host "`n==> $name" -ForegroundColor Cyan }
function Have($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Run($name, [scriptblock]$block) {
  & $block
  if ($LASTEXITCODE -eq 0) { $script:ok += $name } else { $script:fail += $name }
}

# Claude Code plugin marketplace'i ekleyip plugini kullanıcı kapsamında kurar.
function Plugin($name, $repo, $id) {
  Step "$name  ($repo)"
  claude plugin marketplace add $repo *> $null
  Run $name { claude plugin install $id --scope user }
}

# skills CLI (vercel-labs/skills) ile ~/.claude/skills altına global kurulum.
function Skills($name, $repo, [string[]]$extra = @()) {
  Step "$name  ($repo)"
  Run $name { npx -y skills@latest add $repo @extra -g -a claude-code -y }
}

foreach ($c in 'claude', 'git', 'npx') {
  if (-not (Have $c)) { Write-Host "Hata: '$c' bulunamadı. Önce onu kur." -ForegroundColor Red; return }
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
if ((Have bun) -and (Have bash)) {
  if (Test-Path (Join-Path $gstack ".git")) {
    Run "gstack" { git -C $gstack pull --ff-only; if ($LASTEXITCODE -eq 0) { Push-Location $gstack; bash ./setup; Pop-Location } }
  } else {
    Run "gstack" { git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git $gstack; if ($LASTEXITCODE -eq 0) { Push-Location $gstack; bash ./setup; Pop-Location } }
  }
} else {
  Write-Host "bun veya Git Bash yok, gstack atlandı (bun: powershell -c `"irm bun.sh/install.ps1 | iex`")"
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
Run "gsd" { npx -y get-shit-done-cc@latest --claude --global }

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
