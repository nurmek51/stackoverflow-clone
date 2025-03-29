from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, help_text="Название комнаты (для группового чата)")
    participants = models.ManyToManyField(User, related_name="chat_rooms", help_text="Участники чата")
    is_group = models.BooleanField(default=False, help_text="Групповой чат или приватный")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.is_group and self.name:
            return self.name
        return " & ".join([user.username for user in self.participants.all()])

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField(help_text="Текст сообщения")
    timestamp = models.DateTimeField(default=timezone.now)
    # Отметка, что сообщение было прочитано определёнными участниками
    read_by = models.ManyToManyField(User, related_name="read_messages", blank=True)

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"
