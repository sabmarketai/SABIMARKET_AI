from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth_router import router as auth_router
from src.routers import market_router, router
from src.transactions_router import router as transactions_router

app = FastAPI(title="SabiMarket AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)
app.include_router(market_router)
app.include_router(auth_router)
app.include_router(transactions_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
