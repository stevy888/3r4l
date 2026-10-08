#!/bin/bash
# run-chain.sh — THE CARD FILM'S CHAIN OF RECORD (FILM-SPEC.md; rung 8 of Prog-ThreeRulesSite2), every stage in its proven order, so a re-take at
# rung 9 (the pace knob, the pad) is this one command. Zero-LLM: the words are GENERATED from content/card.txt; the voice is the studio's TTS stage;
# the studio is called by absolute path with --skip-build --skip-preflight (its preflight A–F cannot run on a non-KJ film — SKIPPED by design).
# Stages:  job → tts (two passes: the pinned block, then the prayer pass at speed 0.90 over the prayer takes alone) → trim-tails → assemble + retime
#          → the silent bed (pad B; --bed <file> for pad A) → the build by hand → the mix + the studio ledger → the two records → the masters → the VTT → the acceptance.
# Usage: bash film/run-chain.sh [--skip-tts] [--bed <file>] [--pad A|B] [--loudnorm "I=…:TP=…:LRA=11"] [--pad-spend-usd N]   (cwd anywhere; paths absolute)
set -euo pipefail
SITE=/Users/aibrain/projects/3r4l; INPUTS=/Users/aibrain/projects/3r4l-inputs/film; STUDIO=/Users/aibrain/kj-rebuild/scripts/media-plates; JOB=$SITE/film/job; SCR=/Users/aibrain/film-pipeline-lanes/3r4l-card-film
SKIP_TTS=0; BED=""; PAD=B; LOUD=""; SPEND=0
while [ $# -gt 0 ]; do case "$1" in --skip-tts) SKIP_TTS=1;; --bed) BED="$2"; shift;; --pad) PAD="$2"; shift;; --loudnorm) LOUD="$2"; shift;; --pad-spend-usd) SPEND="$2"; shift;; *) echo "unknown arg $1" >&2; exit 2;; esac; shift; done
mkdir -p "$INPUTS/segments" "$INPUTS/work" "$SCR/logs" "$SCR/frames"; LOG=$SCR/logs/chain-$(date -u +%Y%m%dT%H%M%SZ).log; exec > >(tee -a "$LOG") 2>&1
stage() { echo; echo "== $(date -u +%H:%M:%SZ) $*"; }
GEN=(node "$SITE/film/make-narration.mjs"); [ -n "$BED" ] && GEN+=(--bed "$BED"); [ -n "$LOUD" ] && GEN+=(--loudnorm "$LOUD")
stage "1 the job from card.txt"; "${GEN[@]}"
if [ "$SKIP_TTS" = 0 ]; then
  stage "2a tts: the pinned block (ElevenLabs key read by tts_segments.py itself; clean takes are kept — delete a take to re-cut it)"; python3 "$STUDIO/studio/tts_segments.py" --job "$JOB" --out "$INPUTS/segments"
  PB=$(python3 -c "import json;p=json.load(open('$JOB/plan.json'));print(' '.join(s['seg'] for s in p['assembly']['segments'] if s['seg'].split('-')[-1] in p['pace']['prayer_beats']))")
  stage "2b tts: the prayer pass at speed 0.90 — re-cuts ONLY a prayer take that is absent (the first pass's take is moved aside once; a prayer take that fails the gap gate at 0.90 is restored from work/takes-v1 by hand and named in the ledger)"
  mkdir -p "$INPUTS/work/takes-v1"; for s in $PB; do [ -f "$INPUTS/work/takes-v1/$s.mp3" ] || { mv "$INPUTS/segments/$s.mp3" "$INPUTS/work/takes-v1/$s.mp3"; }; done
  python3 "$STUDIO/studio/tts_segments.py" --job "$JOB/prayer-pass" --out "$INPUTS/segments"
fi
stage "3 trim-tails (the takes' trailing silence → segments/trimmed)"; node "$SITE/film/trim-tails.mjs" "$INPUTS/segments"
stage "4 assemble + retime (film-compile pass 1)"; node "$STUDIO/studio/film-compile.mjs" --job "$JOB" --skip-build --skip-preflight --skip-mix --skip-ledger
if [ -z "$BED" ]; then T=$(python3 -c "import json;print(json.load(open('$JOB/beats.json'))['total_s']+6)"); stage "5 the silent bed (pad B), $T s"; ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=44100:cl=mono -t "$T" "$INPUTS/work/bed-silent.wav"; fi
stage "6 the build by hand (the site's woff2 as data URIs; never served)"; node "$STUDIO/build-film.mjs" --template "$JOB/card.template.html" --out "$SITE/film/build/card.html" --fonts "$JOB/fonts.css"
stage "7 the mix + the studio ledger (film-compile pass 2; preflight SKIPPED by design)"; node "$STUDIO/studio/film-compile.mjs" --job "$JOB" --skip-assemble --skip-build --skip-preflight
stage "8 the records (a local HTTP root; 1920x1080 then 1080x1920 of the same build)"; node "$SITE/film/record.mjs" "$SITE/film/build/card.html" 1920x1080 "$INPUTS/work/rec-1920x1080"; node "$SITE/film/record.mjs" "$SITE/film/build/card.html" 1080x1920 "$INPUTS/work/rec-1080x1920"
stage "9 the masters (the mux at the poster wait, chapters, the 720s, the chapter cuts)"; node "$SITE/film/mux.mjs" "$INPUTS/work/rec-1920x1080" "$INPUTS/work/rec-1080x1920" "$INPUTS/work/card-mix.m4a" "$INPUTS"
stage "10 the caption track"; node "$SITE/film/make-vtt.mjs" "$INPUTS/card.vtt"
stage "11 the acceptance (a)–(h) → MASTERS.sha256 + ledger.json"; node "$SITE/film/preflight.mjs" "$INPUTS" "$SCR" --pad "$PAD" --pad-spend-usd "$SPEND"
echo; echo "chain: done → $INPUTS (log $LOG)"
