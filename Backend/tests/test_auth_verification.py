import pytest
from fastapi import HTTPException
from unittest.mock import Mock

from src.services.supabase_client import verify_user


def test_verify_user_returns_user_id(monkeypatch):
    fake_client = Mock()
    fake_client.auth.get_user.return_value = Mock(user=Mock(id="user-123", email="user@example.com"))

    monkeypatch.setattr("src.services.supabase_client.get_supabase_client", lambda: fake_client)

    user = verify_user("Bearer valid-token")

    assert user == {"id": "user-123", "email": "user@example.com"}


def test_verify_user_rejects_invalid_token(monkeypatch):
    fake_client = Mock()
    fake_client.auth.get_user.side_effect = Exception("bad token")

    monkeypatch.setattr("src.services.supabase_client.get_supabase_client", lambda: fake_client)

    with pytest.raises(HTTPException) as exc_info:
        verify_user("Bearer invalid-token")

    assert exc_info.value.status_code == 401
