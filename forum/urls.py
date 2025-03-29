from django.urls import path
from .views import (
    QuestionListView, QuestionDetailView, QuestionCreateView, QuestionUpdateView, QuestionDeleteView,
    AnswerCreateView, AnswerUpdateView, AnswerDeleteView,
    CommentCreateView, CommentUpdateView, CommentDeleteView,
    TagListView, TagDetailView, TagCreateView, TagUpdateView, TagDeleteView,
    VoteCreateView, VoteDeleteView,
    ProfileDetailView, ProfileUpdateView,
    BadgeListView, BadgeDetailView, BadgeCreateView, BadgeUpdateView, BadgeDeleteView,
    UserBadgeListView,
    FavoriteCreateView, FavoriteDeleteView,
    NotificationListView, NotificationUpdateView,
    PostHistoryListView, PostHistoryDetailView,
)

urlpatterns = [
    # questions
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('questions/<int:pk>/update/', QuestionUpdateView.as_view(), name='question-update'),
    path('questions/<int:pk>/delete/', QuestionDeleteView.as_view(), name='question-delete'),

    # answers
    path('questions/<int:question_id>/answers/create/', AnswerCreateView.as_view(), name='answer-create'),
    path('answers/<int:pk>/update/', AnswerUpdateView.as_view(), name='answer-update'),
    path('answers/<int:pk>/delete/', AnswerDeleteView.as_view(), name='answer-delete'),

    # Комментарии (используем content_type_id и object_id для универсальной привязки)
    path('comments/<int:content_type_id>/<int:object_id>/create/', CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/update/', CommentUpdateView.as_view(), name='comment-update'),
    path('comments/<int:pk>/delete/', CommentDeleteView.as_view(), name='comment-delete'),

    # tags
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('tags/<int:pk>/', TagDetailView.as_view(), name='tag-detail'),
    path('tags/create/', TagCreateView.as_view(), name='tag-create'),
    path('tags/<int:pk>/update/', TagUpdateView.as_view(), name='tag-update'),
    path('tags/<int:pk>/delete/', TagDeleteView.as_view(), name='tag-delete'),

    # votes
    path('votes/<int:content_type_id>/<int:object_id>/create/', VoteCreateView.as_view(), name='vote-create'),
    path('votes/<int:pk>/delete/', VoteDeleteView.as_view(), name='vote-delete'),

    # profiles
    path('profiles/<int:pk>/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profiles/<int:pk>/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # bagdes
    path('badges/', BadgeListView.as_view(), name='badge-list'),
    path('badges/<int:pk>/', BadgeDetailView.as_view(), name='badge-detail'),
    path('badges/create/', BadgeCreateView.as_view(), name='badge-create'),
    path('badges/<int:pk>/update/', BadgeUpdateView.as_view(), name='badge-update'),
    path('badges/<int:pk>/delete/', BadgeDeleteView.as_view(), name='badge-delete'),

    path('userbadges/', UserBadgeListView.as_view(), name='userbadge-list'),

    # favorites
    path('favorites/<int:question_id>/create/', FavoriteCreateView.as_view(), name='favorite-create'),
    path('favorites/<int:pk>/delete/', FavoriteDeleteView.as_view(), name='favorite-delete'),

    # norifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/update/', NotificationUpdateView.as_view(), name='notification-update'),

    # edit logs
    path('posthistory/', PostHistoryListView.as_view(), name='posthistory-list'),
    path('posthistory/<int:pk>/', PostHistoryDetailView.as_view(), name='posthistory-detail'),
]
