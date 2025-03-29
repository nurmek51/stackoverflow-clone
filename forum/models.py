from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.text import slugify

User = settings.AUTH_USER_MODEL

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile", primary_key=True)
    reputation = models.IntegerField(default=0)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to="static/images/", blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user}"

class Badge(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    icon = models.ImageField(upload_to="badges/")  # иконка бейджа

    def __str__(self):
        return self.name

class AwardedBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    awarded_at = models.DateTimeField(auto_now_add=True)



class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user}: {self.message[:20]}..."


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    def __str__(self):
        return self.name


class Question(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField('Tag', related_name="questions")
    views = models.PositiveIntegerField(default=0)
    score = models.IntegerField(default=0)
    is_closed = models.BooleanField(default=False)
    slug = models.SlugField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user.username} bookmarked {self.question.title}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="answers")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    score = models.IntegerField(default=0)
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Answer to {self.question.title} by {self.author}"


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    body = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    # Generic relation для привязки комментария к вопросу или ответу
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return f"Comment by {self.author}"


class Vote(models.Model):
    VOTE_TYPES = (
        (1, 'Upvote'),
        (-1, 'Downvote'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votes")

    # Generic relation для голосования как за вопрос, так и за ответ
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    vote = models.SmallIntegerField(choices=VOTE_TYPES)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f"Vote {self.vote} by {self.user} on {self.content_object}"

class PostHistory(models.Model):
    POST_TYPES = (
        ('question', 'Question'),
        ('answer', 'Answer'),
    )
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    post_id = models.PositiveIntegerField()
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    body = models.TextField()
    edited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Edit on {self.post_type} {self.post_id} by {self.edited_by}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="favorited_by")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user} favorited {self.question.title}"

