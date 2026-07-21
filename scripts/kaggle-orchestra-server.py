#!/usr/bin/env python3
"""
Kaggle → Orchestra Core free-GPU inference server.

Paste this whole file into ONE Kaggle notebook cell (GPU accelerator ON, e.g.
"GPU T4 x2") and Run. It:
  1. serves a small open LLM through an OpenAI-compatible API (vLLM),
  2. opens a Cloudflare quick-tunnel so the API has a public https URL,
  3. prints that URL + the exact admin steps.

Then in ulyah.com admin → Orchestra Core → "Kaggle free-GPU endpoint":
  • URL   = the printed https URL + "/v1/chat/completions"
  • Model = the MODEL value below
  • Token = the API_TOKEN below (optional but recommended)
Save it, and Orchestra Core immediately routes AI for the WHOLE ecosystem
(ulyah.com, 1fr.fr, tilawa.de, dawa.es, axto.us, axto.dev, and the article
sites) to this free GPU first — falling back to the donated API keys the
moment this notebook stops. Free tier is ~30h GPU/week per account; run a
notebook per Kaggle account to keep coverage up.

Nothing here is secret to the repo: the API_TOKEN is generated per-session and
only lives in the running notebook + the admin KV entry.
"""
import os, secrets, subprocess, sys, time, urllib.request, re, threading

# A model that fits a free Kaggle T4 (16 GB). Swap for any vLLM-served model;
# an AWQ/GPTQ 7-8B also fits and is stronger. Keep it instruction-tuned.
MODEL = os.environ.get("ORCHESTRA_MODEL", "Qwen/Qwen2.5-3B-Instruct")
PORT = 8000
API_TOKEN = os.environ.get("ORCHESTRA_TOKEN") or secrets.token_urlsafe(24)


def sh(cmd):
    print("＄", cmd, flush=True)
    return subprocess.run(cmd, shell=True, check=False)


def main():
    # 1) deps — vLLM brings its own torch build; --quiet keeps the log short.
    sh(f"{sys.executable} -m pip install --quiet --upgrade vllm==0.6.* || "
       f"{sys.executable} -m pip install --quiet --upgrade vllm")

    # 2) cloudflared binary (quick tunnel, no account needed).
    if not os.path.exists("/usr/local/bin/cloudflared"):
        sh("wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/"
           "cloudflared-linux-amd64 -O /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared")

    # 3) start the OpenAI-compatible server in the background.
    server = subprocess.Popen(
        [sys.executable, "-m", "vllm.entrypoints.openai.api_server",
         "--model", MODEL, "--port", str(PORT),
         "--api-key", API_TOKEN,
         "--max-model-len", "8192",
         "--gpu-memory-utilization", "0.92"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )

    def pump():
        for line in server.stdout:  # surface server logs in the notebook
            print(line, end="", flush=True)
    threading.Thread(target=pump, daemon=True).start()

    # 4) wait until the model is loaded and answering.
    print("\n⏳ Loading model (first run downloads weights, a few minutes)…", flush=True)
    for _ in range(180):
        try:
            req = urllib.request.Request(f"http://127.0.0.1:{PORT}/v1/models",
                                         headers={"Authorization": f"Bearer {API_TOKEN}"})
            if urllib.request.urlopen(req, timeout=3).status == 200:
                print("✅ Model is up.", flush=True)
                break
        except Exception:
            time.sleep(5)
    else:
        print("❌ Server didn't come up — check the log above.", flush=True)
        return

    # 5) open the tunnel and grab the public URL.
    tunnel = subprocess.Popen(
        ["/usr/local/bin/cloudflared", "tunnel", "--url", f"http://127.0.0.1:{PORT}", "--no-autoupdate"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    public = None
    for line in tunnel.stdout:
        print(line, end="", flush=True)
        m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
        if m:
            public = m.group(0)
            break

    if public:
        print("\n" + "=" * 64)
        print("🎉  ORCHESTRA FREE-GPU ENDPOINT IS LIVE")
        print("=" * 64)
        print(f"  URL   : {public}/v1/chat/completions")
        print(f"  Model : {MODEL}")
        print(f"  Token : {API_TOKEN}")
        print("Paste these into ulyah.com admin → Orchestra Core → Kaggle endpoint,")
        print("then Save. Keep this notebook running to keep the endpoint alive.")
        print("=" * 64, flush=True)

    # keep the cell alive so the tunnel + server stay up.
    try:
        tunnel.wait()
    except KeyboardInterrupt:
        pass
    finally:
        server.terminate()


if __name__ == "__main__":
    main()
