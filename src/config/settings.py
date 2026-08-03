from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Whisper (speech-to-text) settings
    whisper_model_size: str = "small"  # tiny | base | small | medium | large-v3
    whisper_device: str = "cpu"  # cpu | cuda
    whisper_compute_type: str = "int8"  # int8 is fastest on CPU

    # LLM (structured extraction) settings
    llm_provider: str = "mock"  # mock | openai | anthropic | grok
    llm_api_key: str | None = None
    llm_model: str | None = None

    # Supabase (auth + database) — same project the Node backend uses
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None


settings = Settings()
