#!/bin/bash
# run-pad-a.sh — PAD A, the second master of record (FILM-SPEC §4 "The pad"; the owner's pad letter at rung 9 is A one pad · B silence): run ONLY after
# the pad-B chain (run-chain.sh) stands. Fetches two Suno takes via the estate's kie.ai path (film/make-pad.mjs, ≈ $0.1), picks the take that covers the
# film (≥ the mix's length; else the longer, extended by one crossfaded repeat), re-mixes the SAME narration under the pad by the plan's mix (0.17 under,
# the outro law), re-muxes the SAME records (the video is unchanged) into pad-a/, and runs the acceptance with --pad A. Pad B's mix and studio ledger are
# kept beside as *-padB. Usage: bash film/run-pad-a.sh [--skip-fetch] [--take 1|2] [--loudnorm "I=…:TP=…:LRA=11"]
set -euo pipefail
SITE=/Users/aibrain/projects/3r4l; INPUTS=/Users/aibrain/projects/3r4l-inputs/film; STUDIO=/Users/aibrain/kj-rebuild/scripts/media-plates; JOB=$SITE/film/job; SCR=/Users/aibrain/film-pipeline-lanes/3r4l-card-film; PAD=$INPUTS/pad-a; WORK=$INPUTS/work
FETCH=1; TAKE=""; LOUD="I=-15.1:TP=-2.6:LRA=11"   # the string of record under the nylon pad (measured 2026-10-08: the studio's I=-14 landed −16.7 LUFS / −0.7 dBTP here; I=-15.1:TP=-2.6 lands −17.8 / −2.2)
while [ $# -gt 0 ]; do case "$1" in --skip-fetch) FETCH=0;; --take) TAKE="$2"; shift;; --loudnorm) LOUD="$2"; shift;; *) echo "unknown arg $1" >&2; exit 2;; esac; shift; done
mkdir -p "$PAD" "$WORK/pad" "$SCR/pad-a"; LOG=$SCR/logs/pad-a-$(date -u +%Y%m%dT%H%M%SZ).log; exec > >(tee -a "$LOG") 2>&1
stage() { echo; echo "== $(date -u +%H:%M:%SZ) $*"; }
[ -f "$INPUTS/ledger.json" ] || { echo "pad A waits on the pad-B chain: $INPUTS/ledger.json is absent" >&2; exit 1; }
if [ "$FETCH" = 1 ]; then stage "1 two Suno takes via kie.ai (the key read by make-pad.mjs itself)"; node "$SITE/film/make-pad.mjs" "$WORK/pad"; fi
NEED=$(python3 -c "import json;b=json.load(open('$JOB/beats.json'));p=json.load(open('$JOB/plan.json'));print(b['total_s']+p['mix']['apad_s']+0.5+1)")
stage "2 the pick (a take must cover $NEED s of mix; else the longer take, extended by one crossfaded repeat)"
BED=$(python3 - "$WORK/pad" "$NEED" "$TAKE" <<'EOF'
import json,subprocess,sys,os
d,need,take=sys.argv[1],float(sys.argv[2]),sys.argv[3]; r=json.load(open(d+'/pad.json'))
dur=lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
takes=[(t['file'],dur(t['file'])) for t in r['takes']]
pick=takes[int(take)-1] if take else (next((t for t in takes if t[1]>=need),None) or max(takes,key=lambda t:t[1]))
f,L=pick; out=d+'/bed-pad-a.mp3'
if L>=need: subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-c:a','libmp3lame','-b:a','192k',out],check=True); how='whole'
else: subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-i',f,'-filter_complex','[0:a][1:a]acrossfade=d=4:c1=tri:c2=tri','-c:a','libmp3lame','-b:a','192k',out],check=True); how='extended by one crossfaded repeat (4 s)'
r['pick']={'file':f,'take_s':round(L,2),'need_s':need,'bed':out,'bed_s':round(dur(out),2),'how':how}; json.dump(r,open(d+'/pad.json','w'),indent=1); print(out)
EOF
)
echo "bed: $BED"; SPEND=$(python3 -c "import json;print(json.load(open('$WORK/pad/pad.json')).get('spend_usd_est',0))")
stage "3 keep pad B's mix and studio ledger beside"; cp "$WORK/card-mix.m4a" "$WORK/card-mix-padB.m4a"; cp "$JOB/ledger.json" "$JOB/ledger-padB.json"
stage "4 the plan with the pad as the bed, the mix (film-compile pass 2: retime idempotent · mix · ledger)"; node "$SITE/film/make-narration.mjs" --bed "$BED" --loudnorm "$LOUD"
node "$STUDIO/studio/film-compile.mjs" --job "$JOB" --skip-assemble --skip-build --skip-preflight
ffmpeg -hide_banner -i "$WORK/card-mix.m4a" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
stage "5 the masters under pad A (the same records, the pad mix)"; node "$SITE/film/mux.mjs" "$WORK/rec-1920x1080" "$WORK/rec-1080x1920" "$WORK/card-mix.m4a" "$PAD"; cp "$INPUTS/card.vtt" "$PAD/card.vtt"
NOTE="pad A: one quiet nylon-guitar pad, two Suno V5_5 takes via kie.ai ($(python3 -c "import json;r=json.load(open('$WORK/pad/pad.json'));print(r['pick']['how'],'· take',r['pick']['take_s'],'s · bed',r['pick']['bed_s'],'s · credits',r.get('credits_spent'))")), 0.17 under the voice, the outro law; the brief in work/pad/pad.json"
stage "6 the acceptance under pad A"; node "$SITE/film/preflight.mjs" "$PAD" "$SCR/pad-a" --pad A --pad-spend-usd "$SPEND" --work "$WORK" --pad-note "$NOTE" || true
stage "7 the plan back on pad B (the bed of the top-level masters) so the job dir reads as the pad-B masters do"; node "$SITE/film/make-narration.mjs" >/dev/null; cp "$WORK/card-mix-padB.m4a" "$WORK/card-mix.m4a"; cp "$JOB/ledger-padB.json" "$JOB/ledger.json"
echo; echo "pad A: done → $PAD (log $LOG)"
