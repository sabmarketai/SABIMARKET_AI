import tempfile
from datetime import date

from fastapi import APIRouter, UploadFile

from src.schemas.transaction import VoiceTransactionResponse
from src.services.transcription_service import transcribe_audio
from src.services.extraction_service import extract_transactions

router = APIRouter(prefix="/api/v1/voice", tags=["voice-transaction"])

@router.post("/voice-transaction", response_model=VoiceTransactionResponse)
async def voice_transaction(audio: UploadFile) -> VoiceTransactionResponse:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(await audio.read())
        tmp.flush()
        transcript = transcribe_audio(tmp.name)

    return extract_transactions(transcript, date=date.today().isoformat())

