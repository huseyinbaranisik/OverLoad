#!/usr/bin/env bash
# Claude Code skill paketlerini tek seferde kurar (macOS / Linux / WSL / Git Bash).
#
#   curl -fsSL https://raw.githubusercontent.com/huseyinbaranisik/OverLoad/main/tools/install-skills.sh | bash
#
# Gerekenler: claude (Claude Code CLI), git, node/npx. gstack için bun, headroom ve ppt-master için python.
# Biri başarısız olursa script durmaz, sonda hangilerinin kurulamadığını listeler.

set -u

ok=()
fail=()

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
# curl | bash ile çalışınca stdin script'in kendisi; komutlar onu yutmasın diye girdi terminalden gelir.
tty=/dev/null
(: </dev/tty) 2>/dev/null && tty=/dev/tty
run() {
  local name="$1"; shift
  if "$@" <"$tty"; then ok+=("$name"); else fail+=("$name"); fi
}
have() { command -v "$1" >/dev/null 2>&1; }

# Claude Code plugin marketplace'i ekleyip plugini kullanıcı kapsamında kurar.
plugin() {
  local name="$1" repo="$2" id="$3"
  step "$name  ($repo)"
  run "$name" sh -c "claude plugin marketplace add '$repo' >/dev/null 2>&1 || true; claude plugin install '$id' --scope user"
}

# skills CLI (vercel-labs/skills) ile ~/.claude/skills altına global kurulum.
skills() {
  local name="$1"; shift
  step "$name  ($1)"
  run "$name" npx -y skills@latest add "$@" -g -a claude-code -y
}

for c in claude git npx; do
  have "$c" || { echo "Hata: '$c' bulunamadı. Önce onu kur." >&2; exit 1; }
done

# 1. satır: ponytail, karpathy, superpowers, ecc, Matt Pocock
plugin "ponytail"        DietrichGebert/ponytail             ponytail@ponytail
plugin "karpathy skills" multica-ai/andrej-karpathy-skills   andrej-karpathy-skills@karpathy-skills
plugin "superpowers"     obra/superpowers-marketplace        superpowers@superpowers-marketplace
plugin "ecc"             affaan-m/everything-claude-code     ecc@ecc
plugin "matt pocock"     mattpocock/skills                   mattpocock-skills@mattpocock

# agent skills (Addy Osmani plugini + Vercel skill paketi)
plugin "agent skills (addyosmani)" addyosmani/agent-skills   agent-skills@addy-agent-skills
skills "agent skills (vercel)"     vercel-labs/agent-skills  --skill '*'

# 2. satır: gstack, caveman, claude-mem, headroom, gsd, bmad
step "gstack  (garrytan/gstack)"
if have bun; then
  if [ -d "$HOME/.claude/skills/gstack/.git" ]; then
    run "gstack" sh -c 'cd "$HOME/.claude/skills/gstack" && git pull --ff-only && ./setup'
  else
    run "gstack" sh -c 'git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git "$HOME/.claude/skills/gstack" && cd "$HOME/.claude/skills/gstack" && ./setup'
  fi
else
  echo "bun yok, gstack atlandı (kur: curl -fsSL https://bun.sh/install | bash)"; fail+=("gstack (bun yok)")
fi

plugin "caveman"    JuliusBrussee/caveman  caveman@caveman
plugin "claude-mem" thedotmack/claude-mem  claude-mem@thedotmack

step "headroom CLI  (headroom-ai)"
if have uv; then
  run "headroom CLI" uv tool install --python 3.13 "headroom-ai[all]"
elif have pip3 || have pip; then
  run "headroom CLI" "$(command -v pip3 || command -v pip)" install --user "headroom-ai[all]"
else
  echo "uv/pip yok, headroom CLI atlandı"; fail+=("headroom CLI (python yok)")
fi
plugin "headroom" chopratejas/headroom headroom@headroom-marketplace

step "gsd  (get-shit-done-cc)"
run "gsd" npx -y get-shit-done-cc@latest --claude --global

skills "bmad method" bmad-code-org/BMAD-METHOD --skill '*'

# 3. satır: UI UX pro max, taste, archify, diagram design, ppt master, impeccable
plugin "ui ux pro max"  nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max@ui-ux-pro-max-skill
plugin "taste"          Leonxlnx/taste-skill                 taste-skill@taste-skill
skills "archify"        tt-a1i/archify
plugin "diagram design" cathrynlavery/diagram-design         diagram-design@diagram-design
plugin "ppt master"     hugohe3/ppt-master                   ppt-master@ppt-master
if have pip3 || have pip; then
  run "ppt master (python paketleri)" "$(command -v pip3 || command -v pip)" install --user -r \
    https://raw.githubusercontent.com/hugohe3/ppt-master/HEAD/skills/ppt-master/requirements.txt
fi
plugin "impeccable"     pbakaus/impeccable                   impeccable@impeccable

printf '\n\033[1;32mKuruldu (%d):\033[0m %s\n' "${#ok[@]}" "$(IFS=,; echo "${ok[*]:-}")"
if [ "${#fail[@]}" -gt 0 ]; then
  printf '\033[1;31mKurulamadı (%d):\033[0m %s\n' "${#fail[@]}" "$(IFS=,; echo "${fail[*]}")"
fi
echo
echo "Claude Code'u yeniden başlat. Headroom için bir kez: headroom deploy  (ya da: headroom wrap claude)"
