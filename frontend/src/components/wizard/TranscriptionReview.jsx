import { useEffect, useRef, useState } from 'react';

export default function TranscriptionReview({
  id,
  transcript,
  onTranscriptChange,
  onRetry,
  onContinueManually,
  onConfirm,
  existingText = '',
  audioSrc
}) {
  const reviewId = `${id}-transcription-review`;
  const helpId = `${reviewId}-help`;
  const transcriptRef = useRef(null);
  const audioRef = useRef(null);
  const [playbackStatus, setPlaybackStatus] = useState('');
  const isTranscriptEmpty = !transcript.trim();

  useEffect(() => {
    transcriptRef.current?.focus();
  }, []);

  useEffect(() => {
    setPlaybackStatus('');
    return () => audioRef.current?.pause();
  }, [audioSrc]);

  return (
    <section aria-labelledby={`${reviewId}-heading`} className="space-y-4">
      <div>
        <h2 id={`${reviewId}-heading`} className="text-lg font-semibold">
          Review your transcription
        </h2>
        <p id={helpId} className="mt-1 text-sm text-gray-300">
          Edit the recognized text before confirming. You can retry or return to your typed answer.
        </p>
        {existingText.trim() && (
          <p className="mt-2 text-sm text-gray-300">
            Confirming will keep your existing answer and append this transcription.
          </p>
        )}
      </div>

      <label htmlFor={reviewId} className="block text-sm font-medium">
        Recognized text
      </label>
      <textarea
        ref={transcriptRef}
        id={reviewId}
        value={transcript}
        onChange={(event) => onTranscriptChange(event.target.value)}
        aria-describedby={helpId}
        rows={5}
        className="w-full rounded-xl border border-gray-500 bg-gray-950 px-4 py-3 text-white focus:border-blue-500"
      />

      {audioSrc ? (
        <div>
          <p className="mb-2 text-sm font-medium">Original speech recording</p>
          <audio
            ref={audioRef}
            controls
            preload="metadata"
            aria-label="Original speech recording"
            src={audioSrc}
            onPlay={() => setPlaybackStatus('Playing the original recording.')}
            onPause={() => {
              if (!audioRef.current?.ended) setPlaybackStatus('Original recording paused.');
            }}
            onEnded={() => setPlaybackStatus('Original recording finished.')}
            onError={() => setPlaybackStatus('The original recording could not be played.')}
          />
          {playbackStatus && (
            <p className="mt-2 text-sm text-gray-300" role="status" aria-live="polite">
              {playbackStatus}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-300">
          Original audio playback is unavailable because speech recognition did not provide a recording.
        </p>
      )}

      {isTranscriptEmpty && (
        <p className="text-sm text-amber-200" role="status" aria-live="polite">
          The transcription is empty. Retry speech recognition or continue with your typed answer.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-gray-500 bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          Retry speech recognition
        </button>
        <button
          type="button"
          onClick={onContinueManually}
          className="rounded-lg border border-gray-500 bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          Continue with typed text
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isTranscriptEmpty}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
        >
          Confirm transcription
        </button>
      </div>
    </section>
  );
}
