import tempfile
from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException, UploadFile

from src.schemas.market import MarketRecommendation, PricePrediction
from src.schemas.transaction import TranscriptRequest, VoiceTransactionResponse
from src.services.market_service import predict_price, recommend_market
from src.services.transcription_service import transcribe_audio
from src.services.extraction_service import extract_transactions

router = APIRouter(prefix="/api/v1/voice", tags=["voice-transaction"])
market_router = APIRouter(prefix="/api/v1/market", tags=["market"])

_MAX_AUDIO_BYTES = 10 * 1024 * 1024  # generous for a short trader voice note, protects a memory-constrained instance


@router.post("/voice-transaction", response_model=VoiceTransactionResponse)
async def voice_transaction(audio: UploadFile) -> VoiceTransactionResponse:
    data = await audio.read()
    if len(data) > _MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Recording is too large — please keep it under 10MB.")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            transcript = transcribe_audio(tmp.name)
        except Exception:
            raise HTTPException(status_code=503, detail="Couldn't process that recording — please try again.")

    try:
        return extract_transactions(transcript, date=date.today().isoformat())
    except Exception:
        raise HTTPException(status_code=503, detail="Couldn't understand that recording — please try again.")


@router.post("/extract-text", response_model=VoiceTransactionResponse)
def extract_text(body: TranscriptRequest) -> VoiceTransactionResponse:
    """For clients that already have a transcript (e.g. the browser's own
    speech recognition) — skips Whisper and goes straight to extraction."""
    try:
        return extract_transactions(body.transcript, date=date.today().isoformat())
    except Exception:
        raise HTTPException(status_code=503, detail="Couldn't process that transcript — please try again.")


@market_router.get("/predict", response_model=PricePrediction)
def predict(item: str, market: str = "Mile 12") -> PricePrediction:
    try:
        return predict_price(item, market)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@market_router.get("/recommend", response_model=MarketRecommendation)
def recommend(item: str, action: Literal["buy", "sell"]) -> MarketRecommendation:
    try:
        return recommend_market(item, action)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

