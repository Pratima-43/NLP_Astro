"""Outgoing email over SMTP. Without SMTP settings, development logs the message instead of sending it."""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("astroverse.email")


def email_configured() -> bool:
    return bool(settings.smtp_host)


def send_email(to: str, subject: str, text: str) -> bool:
    """Send a plain-text email. Returns False when it could not be delivered (never raises)."""
    if not email_configured():
        if settings.app_env == "development":
            # Visible in the server console so a developer can follow emailed links locally.
            logger.warning("SMTP not configured; email not sent.\nTo: %s\nSubject: %s\n\n%s", to, subject, text)
        else:
            logger.error("SMTP not configured; could not email %s (%s).", to, subject)
        return False

    message = EmailMessage()
    message["From"] = settings.smtp_from or settings.smtp_username or "no-reply@astroverse.app"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    try:
        context = ssl.create_default_context()
        if settings.smtp_use_ssl:
            server: smtplib.SMTP = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20, context=context)
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)
            server.starttls(context=context)
        with server:
            if settings.smtp_username:
                server.login(settings.smtp_username, settings.smtp_password or "")
            server.send_message(message)
        return True
    except (smtplib.SMTPException, OSError) as exc:
        logger.error("Could not send email to %s: %s", to, exc)
        return False
