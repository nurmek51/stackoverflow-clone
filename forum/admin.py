from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import (
    Question, Answer, Comment, Tag, Vote, Profile, Badge,
    AwardedBadge, Favorite, Notification, PostHistory,
)

class CommentInline(GenericTabularInline):
    model = Comment
    extra = 0

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'views', 'score', 'is_closed')
    list_filter = ('is_closed', 'created_at', 'tags')
    search_fields = ('title', 'body')
    inlines = [AnswerInline, CommentInline]

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'author', 'created_at', 'score', 'is_accepted')
    list_filter = ('is_accepted', 'created_at')
    search_fields = ('body',)
    inlines = [CommentInline]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'created_at', 'content_object')
    list_filter = ('created_at',)
    search_fields = ('body',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'vote', 'content_object')
    list_filter = ('vote',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'reputation')
    search_fields = ('user__username',)

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(AwardedBadge)
class AwardedBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')
    list_filter = ('awarded_at',)

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'added_at')
    list_filter = ('added_at',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')

@admin.register(PostHistory)
class PostHistoryAdmin(admin.ModelAdmin):
    list_display = ('post_type', 'post_id', 'edited_by', 'edited_at')
    list_filter = ('post_type', 'edited_at')
