from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import router

app = FastAPI(title="SabiMarket AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
