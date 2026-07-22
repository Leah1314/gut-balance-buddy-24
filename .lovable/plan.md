## Plan: Remove voice input feature

### Changes
- **`src/components/ChatPage.tsx`**: Remove the `VoiceInputButton` import and its usage from the composer area next to the image upload button.
- **`src/components/VoiceInputButton.tsx`**: Delete the file.
- **`supabase/functions/transcribe-audio/index.ts`**: Delete the edge function (no longer used).

### Kept intact
- Chat text input, send button, and image upload remain unchanged.
- No changes to `gut-health-chat` function or any other logic.

The voice code can be re-added later from git history if needed.