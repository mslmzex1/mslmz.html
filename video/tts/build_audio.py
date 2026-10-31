"""Sahne metinlerini seslendirir, public/audio.mp3 + src/timeline.json üretir.
Önce edge-tts (tr-TR-AhmetNeural) dener; ağ engelliyse espeak-ng'ye düşer."""
import json, math, subprocess, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
FPS, GAP = 30, 0.6  # sahne arası sessizlik (sn)
scenes = json.load(open(ROOT / "tts/script.json"))

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of", "csv=p=0", str(p)]).decode())

engine = "edge-tts"
for s in scenes:
    wav = ROOT / f"tts/{s['id']}.wav"
    ok = False
    if engine == "edge-tts":
        mp3 = ROOT / f"tts/{s['id']}.mp3"
        r = subprocess.run(["edge-tts", "--voice", "tr-TR-AhmetNeural", "--text", s["text"],
                            "--write-media", str(mp3)], capture_output=True)
        ok = r.returncode == 0 and mp3.stat().st_size > 0
        if ok:
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ar", "48000", "-ac", "1", str(wav)], check=True)
        else:
            engine = "espeak-ng"
    if not ok:
        raw = ROOT / f"tts/{s['id']}_raw.wav"
        subprocess.run(["espeak-ng", "-v", "tr+m3", "-s", "155", "-p", "40", "-w", str(raw), s["text"]], check=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af",
                        "highpass=f=80,lowpass=f=9000,acompressor=threshold=-18dB:ratio=3,aecho=0.8:0.5:20:0.12",
                        "-ar", "48000", "-ac", "1", str(wav)], check=True)
    s["sec"] = dur(wav)

# ses + boşlukları birleştir
silence = ROOT / "tts/gap.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono",
                "-t", str(GAP), str(silence)], check=True)
lst = ROOT / "tts/list.txt"
lst.write_text("".join(f"file '{s['id']}.wav'\nfile 'gap.wav'\n" for s in scenes))
(ROOT / "public").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", "-b:a", "192k",
                str(ROOT / "public/audio.mp3")], check=True)

total = dur(ROOT / "public/audio.mp3")
frame, out = 0, []
for s in scenes:
    n = math.ceil((s["sec"] + GAP) * FPS)
    out.append({"id": s["id"], "title": s["title"], "text": s["text"], "from": frame, "duration": n,
                "voiceFrames": math.ceil(s["sec"] * FPS)})
    frame += n
totalFrames = max(frame, math.ceil(total * FPS))
json.dump({"fps": FPS, "engine": engine, "audioSec": total, "totalFrames": totalFrames, "scenes": out},
          open(ROOT / "src/timeline.json", "w"), ensure_ascii=False, indent=1)
print(f"engine={engine} audio={total:.2f}s frames={totalFrames}")
