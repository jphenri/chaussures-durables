# Sora prompts for boot state visuals

Target visuals:
1. Broken boot
2. Deconstructed boot
3. Repaired boot

## Requirements

- Set `OPENAI_API_KEY` in your shell.
- Ensure Sora API access is enabled for your OpenAI org.

## Suggested commands

```bash
python3 "$HOME/.codex/skills/sora/scripts/sora.py" create-and-poll \
  --model sora-2 \
  --prompt "Use case: website illustration. Primary request: single broken leather boot on a shoemaker bench, visible torn seam and detached sole, no people, under-18 safe, cartoon realism. Scene/background: warm workshop table, soft studio light. Camera: static close-up. Constraints: no logos, no text." \
  --size 1280x720 --seconds 4 --download --variant thumbnail \
  --out assets/img/sora/boot-broken.webp

python3 "$HOME/.codex/skills/sora/scripts/sora.py" create-and-poll \
  --model sora-2 \
  --prompt "Use case: website illustration. Primary request: one leather boot deconstructed into clean layers (upper, welt, outsole, heel block) laid out on a cobbler table, no people, under-18 safe, cartoon realism. Scene/background: tidy workshop top-down composition. Camera: static top view. Constraints: no logos, no text." \
  --size 1280x720 --seconds 4 --download --variant thumbnail \
  --out assets/img/sora/boot-deconstructed.webp

python3 "$HOME/.codex/skills/sora/scripts/sora.py" create-and-poll \
  --model sora-2 \
  --prompt "Use case: website illustration. Primary request: fully repaired leather boot with clean stitching and polished finish on a shoemaker bench, no people, under-18 safe, cartoon realism. Scene/background: warm workshop light, premium craftsmanship mood. Camera: static close-up. Constraints: no logos, no text." \
  --size 1280x720 --seconds 4 --download --variant thumbnail \
  --out assets/img/sora/boot-repaired.webp
```
