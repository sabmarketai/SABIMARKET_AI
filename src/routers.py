import tempfile
from datetime import date

from fastapi import APIRouter, HTTPException, UploadFile

from src.schemas.market import PricePrediction
from src.schemas.transaction import TranscriptRequest, VoiceTransactionResponse
from src.services.market_service import predict_price
from src.services.transcription_service import transcribe_audio
from src.services.extraction_service import extract_transactions

router = APIRouter(prefix="/api/v1/voice", tags=["voice-transaction"])
market_router = APIRouter(prefix="/api/v1/market", tags=["market"])

@router.post("/voice-transaction", response_model=VoiceTransactionResponse)
async def voice_transaction(audio: UploadFile) -> VoiceTransactionResponse:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(await audio.read())
        tmp.flush()
        transcript = transcribe_audio(tmp.name)

    return extract_transactions(transcript, date=date.today().isoformat())


@router.post("/extract-text", response_model=VoiceTransactionResponse)
def extract_text(body: TranscriptRequest) -> VoiceTransactionResponse:
    """For clients that already have a transcript (e.g. the browser's own
    speech recognition) — skips Whisper and goes straight to extraction."""
    return extract_transactions(body.transcript, date=date.today().isoformat())


@market_router.get("/predict", response_model=PricePrediction)
def predict(item: str, market: str = "Mile 12") -> PricePrediction:
    try:
        return predict_price(item, market)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

