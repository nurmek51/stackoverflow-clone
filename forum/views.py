from django.urls import reverse, reverse_lazy
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import (
    Question, Answer, Comment, Tag, Vote, Profile, Badge, UserBadge,
    Favorite, Notification, PostHistory
)

####################################
# Вьюшки для модели Question
####################################
class QuestionListView(ListView):
    model = Question
    template_name = 'forum/question_list.html'
    context_object_name = 'questions'
    ordering = ['-created_at']
    paginate_by = 10

class QuestionDetailView(DetailView):
    model = Question
    template_name = 'forum/question_detail.html'
    context_object_name = 'question'

class QuestionCreateView(LoginRequiredMixin, CreateView):
    model = Question
    fields = ['title', 'body', 'tags']
    template_name = 'forum/question_form.html'

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

class QuestionUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Question
    fields = ['title', 'body', 'tags']
    template_name = 'forum/question_form.html'

    def test_func(self):
        question = self.get_object()
        return self.request.user == question.author

class QuestionDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Question
    template_name = 'forum/question_confirm_delete.html'
    success_url = reverse_lazy('question-list')

    def test_func(self):
        question = self.get_object()
        return self.request.user == question.author

####################################
# Вьюшки для модели Answer
####################################
class AnswerCreateView(LoginRequiredMixin, CreateView):
    model = Answer
    fields = ['body']
    template_name = 'forum/answer_form.html'

    def form_valid(self, form):
        form.instance.author = self.request.user
        # Ожидаем, что в URL передаётся question_id
        question = get_object_or_404(Question, id=self.kwargs.get('question_id'))
        form.instance.question = question
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class AnswerUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Answer
    fields = ['body']
    template_name = 'forum/answer_form.html'

    def test_func(self):
        answer = self.get_object()
        return self.request.user == answer.author

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class AnswerDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Answer
    template_name = 'forum/answer_confirm_delete.html'

    def test_func(self):
        answer = self.get_object()
        return self.request.user == answer.author

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

####################################
# Вьюшки для модели Comment
####################################
class CommentCreateView(LoginRequiredMixin, CreateView):
    model = Comment
    fields = ['body']
    template_name = 'forum/comment_form.html'

    def form_valid(self, form):
        form.instance.author = self.request.user
        # Ожидаем передачу content_type_id и object_id через URL kwargs
        content_type_id = self.kwargs.get('content_type_id')
        object_id = self.kwargs.get('object_id')
        form.instance.content_type = get_object_or_404(ContentType, id=content_type_id)
        form.instance.object_id = object_id
        return super().form_valid(form)

    def get_success_url(self):
        # Если модель объекта поддерживает метод get_absolute_url, перенаправляем на него
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

class CommentUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Comment
    fields = ['body']
    template_name = 'forum/comment_form.html'

    def test_func(self):
        comment = self.get_object()
        return self.request.user == comment.author

    def get_success_url(self):
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

class CommentDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Comment
    template_name = 'forum/comment_confirm_delete.html'

    def test_func(self):
        comment = self.get_object()
        return self.request.user == comment.author

    def get_success_url(self):
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

####################################
# Вьюшки для модели Tag
####################################
class TagListView(ListView):
    model = Tag
    template_name = 'forum/tag_list.html'
    context_object_name = 'tags'

class TagDetailView(DetailView):
    model = Tag
    template_name = 'forum/tag_detail.html'
    context_object_name = 'tag'

class TagCreateView(LoginRequiredMixin, CreateView):
    model = Tag
    fields = ['name', 'slug']
    template_name = 'forum/tag_form.html'

class TagUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Tag
    fields = ['name', 'slug']
    template_name = 'forum/tag_form.html'

    def test_func(self):
        # Обновлять теги смогут только админы или сотрудники
        return self.request.user.is_staff

class TagDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Tag
    template_name = 'forum/tag_confirm_delete.html'
    success_url = reverse_lazy('tag-list')

    def test_func(self):
        return self.request.user.is_staff

####################################
# Вьюшки для модели Vote (голосования)
####################################
class VoteCreateView(LoginRequiredMixin, CreateView):
    model = Vote
    fields = ['vote']
    template_name = 'forum/vote_form.html'

    def form_valid(self, form):
        form.instance.user = self.request.user
        content_type_id = self.kwargs.get('content_type_id')
        object_id = self.kwargs.get('object_id')
        form.instance.content_type = get_object_or_404(ContentType, id=content_type_id)
        form.instance.object_id = object_id
        return super().form_valid(form)

    def get_success_url(self):
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

class VoteDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Vote
    template_name = 'forum/vote_confirm_delete.html'

    def test_func(self):
        vote = self.get_object()
        return self.request.user == vote.user

    def get_success_url(self):
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

####################################
# Вьюшки для модели Profile
####################################
class ProfileDetailView(DetailView):
    model = Profile
    template_name = 'forum/profile_detail.html'
    context_object_name = 'profile'

class ProfileUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Profile
    fields = ['bio', 'avatar']
    template_name = 'forum/profile_form.html'

    def test_func(self):
        profile = self.get_object()
        return self.request.user == profile.user

    def get_success_url(self):
        return reverse('profile-detail', kwargs={'pk': self.object.pk})

####################################
# Вьюшки для модели Badge
####################################
class BadgeListView(ListView):
    model = Badge
    template_name = 'forum/badge_list.html'
    context_object_name = 'badges'

class BadgeDetailView(DetailView):
    model = Badge
    template_name = 'forum/badge_detail.html'
    context_object_name = 'badge'

class BadgeCreateView(LoginRequiredMixin, CreateView):
    model = Badge
    fields = ['name', 'description', 'icon']
    template_name = 'forum/badge_form.html'

class BadgeUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Badge
    fields = ['name', 'description', 'icon']
    template_name = 'forum/badge_form.html'

    def test_func(self):
        return self.request.user.is_staff

class BadgeDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Badge
    template_name = 'forum/badge_confirm_delete.html'
    success_url = reverse_lazy('badge-list')

    def test_func(self):
        return self.request.user.is_staff

####################################
# Вьюшки для модели UserBadge
####################################
class UserBadgeListView(LoginRequiredMixin, ListView):
    model = UserBadge
    template_name = 'forum/userbadge_list.html'
    context_object_name = 'user_badges'

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)


####################################
# Вьюшки для модели Favorite (избранное)
####################################
class FavoriteCreateView(LoginRequiredMixin, CreateView):
    model = Favorite
    fields = []  # Дополнительных полей нет – связь устанавливается автоматически
    template_name = 'forum/favorite_confirm.html'

    def form_valid(self, form):
        form.instance.user = self.request.user
        question = get_object_or_404(Question, id=self.kwargs.get('question_id'))
        form.instance.question = question
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class FavoriteDeleteView(LoginRequiredMixin, DeleteView):
    model = Favorite
    template_name = 'forum/favorite_confirm_delete.html'

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

####################################
# Вьюшки для модели Notification
####################################
class NotificationListView(LoginRequiredMixin, ListView):
    model = Notification
    template_name = 'forum/notification_list.html'
    context_object_name = 'notifications'

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationUpdateView(LoginRequiredMixin, UpdateView):
    model = Notification
    fields = ['is_read']
    template_name = 'forum/notification_form.html'

    def form_valid(self, form):
        form.instance.is_read = True
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('notification-list')

####################################
# Вьюшки для модели PostHistory (история правок) – только для чтения
####################################
class PostHistoryListView(ListView):
    model = PostHistory
    template_name = 'forum/posthistory_list.html'
    context_object_name = 'histories'

class PostHistoryDetailView(DetailView):
    model = PostHistory
    template_name = 'forum/posthistory_detail.html'
    context_object_name = 'history'
