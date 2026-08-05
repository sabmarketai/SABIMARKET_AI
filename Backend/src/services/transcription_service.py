from faster_whisper import WhisperModel

from src.config.settings import settings

_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
    return _model


def transcribe_audio(file_path: str) -> str:
    model = _get_model()
    # Pidgin is English-lexified, so English mode handles it reasonably well.
    segments, _info = model.transcribe(file_path, language="en", vad_filter=True)
    return " ".join(segment.text.strip() for segment in segments).strip()
