from django.urls import path
from .views import (
    MainPageView, SearchView,
    QuestionListView, QuestionDetailView, QuestionCreateView, QuestionUpdateView, QuestionDeleteView, QuestionVoteView,
    AnswerCreateView, AnswerUpdateView, AnswerDeleteView, AnswerVoteView, AcceptAnswerView,
    TagListView, TagDetailView, TagCreateView, TagUpdateView, TagDeleteView,
    VoteCreateView, VoteDeleteView, UserListView,
    ProfileDetailView, ProfileUpdateView,
    AwardedBadgeListView, CustomRegisterView, GuidelineView, AwardBadgeView,
    FavoriteCreateView, FavoriteDeleteView,
    NotificationListView, NotificationUpdateView,
    PostHistoryListView, PostHistoryDetailView, CustomJWTLoginView,
    CustomPasswordResetView, CustomPasswordResetDoneView,
    CustomPasswordResetConfirmView, CustomPasswordResetCompleteView, Terms, Privacy, BookmarkQuestionView
)
from django.contrib.auth.views import LogoutView

app_name = 'forum'

urlpatterns = [
    path('terms/', Privacy.as_view(), name='terms'),
    path('privacy/', Terms.as_view(), name='privacy'),
    path('guideline/', GuidelineView.as_view(), name='guidelines'),
    path('', MainPageView.as_view(), name='index'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('search/', SearchView.as_view(), name='search'),

    # Аутентификация
    path('register/', CustomRegisterView.as_view(), name='register'),
    path('login/', CustomJWTLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='forum:index'), name='logout'),

    # Вопросы
    path('questions/', QuestionListView.as_view(), name='question_list'),
    path('questions/<int:pk>/<slug:slug>/', QuestionDetailView.as_view(), name='question_detail'),
    path('questions/create/', QuestionCreateView.as_view(), name='question_create'),
    path('questions/<int:pk>/update/', QuestionUpdateView.as_view(), name='question_update'),
    path('questions/<int:pk>/delete/', QuestionDeleteView.as_view(), name='question_delete'),
    path('questions/<int:pk>/bookmark/', BookmarkQuestionView.as_view(), name='bookmark_question'),
    path('questions/<int:pk>/vote/', QuestionVoteView.as_view(), name='question_vote'),

    # Ответы
    path('questions/<int:question_id>/answers/create/', AnswerCreateView.as_view(), name='answer_create'),
    path('answers/<int:pk>/update/', AnswerUpdateView.as_view(), name='answer_update'),
    path('answers/<int:pk>/delete/', AnswerDeleteView.as_view(), name='answer_delete'),
    path('answers/<int:pk>/vote/', AnswerVoteView.as_view(), name='answer_vote'),
    path('answers/<int:pk>/accept/', AcceptAnswerView.as_view(), name='accept_answer'),

    # Теги
    path('tags/', TagListView.as_view(), name='tag_list'),
    path('tags/<slug:slug>/', TagDetailView.as_view(), name='tag_detail'),
    path('tags/create/', TagCreateView.as_view(), name='tag_create'),
    path('tags/<int:pk>/update/', TagUpdateView.as_view(), name='tag_update'),
    path('tags/<int:pk>/delete/', TagDeleteView.as_view(), name='tag_delete'),

    # Голосования (дополнительные)
    path('votes/<int:content_type_id>/<int:object_id>/create/', VoteCreateView.as_view(), name='vote_create'),
    path('votes/<int:pk>/delete/', VoteDeleteView.as_view(), name='vote_delete'),

    # Профили
    path('profiles/<int:pk>/', ProfileDetailView.as_view(), name='profile'),
    path('profiles/<int:pk>/update/', ProfileUpdateView.as_view(), name='profile_update'),

    # Бейджи
    path('questions/<int:pk>/award_badge', AwardBadgeView.as_view(), name='award_badge'),

    # Пользовательские бейджи
    path('userbadges/', AwardedBadgeListView.as_view(), name='userbadge_list'),

    # Избранное
    path('favorites/<int:question_id>/create/', FavoriteCreateView.as_view(), name='favorite_create'),
    path('favorites/<int:pk>/delete/', FavoriteDeleteView.as_view(), name='favorite_delete'),

    # Уведомления
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/update/', NotificationUpdateView.as_view(), name='notification_update'),

    # История правок
    path('posthistory/', PostHistoryListView.as_view(), name='posthistory_list'),
    path('posthistory/<int:pk>/', PostHistoryDetailView.as_view(), name='posthistory_detail'),

    # Сброс пароля
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
