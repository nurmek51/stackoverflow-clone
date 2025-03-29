from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.models import User
from django.contrib.auth import views as auth_views
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Sum, Q, Count
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
from django.views.generic.edit import FormView
from django import forms

from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .forms import QuestionForm
from .models import Question, Answer, Comment, Tag, Vote, Profile, Badge, AwardedBadge, Favorite, Notification, PostHistory, Bookmark
from .serializers import RegisterSerializer


class Privacy(View):
    template_name = 'privacy.html'

class Terms(View):
    template_name = 'terms.html'

class CustomPasswordResetView(auth_views.PasswordResetView):
    template_name = 'password_reset_form.html'
    email_template_name = 'password_reset_email.html'
    success_url = reverse_lazy('forum:password_reset_done')

class CustomPasswordResetDoneView(auth_views.PasswordResetDoneView):
    template_name = 'password_reset_done.html'

class CustomPasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    template_name = 'password_reset_confirm.html'
    success_url = reverse_lazy('forum:password_reset_complete')

class CustomPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    template_name = 'password_reset_complete.html'

class CustomRegisterView(FormView):
    template_name = 'register.html'
    form_class = UserCreationForm
    success_url = reverse_lazy('forum:index')

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return super().form_valid(form)

class CustomJWTLoginView(View):
    template_name = 'login.html'

    def get(self, request, *args, **kwargs):
        form = AuthenticationForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('forum:index')
        return render(request, self.template_name, {'form': form})

class MainPageView(ListView):
    model = Question
    template_name = 'index.html'
    context_object_name = 'questions'
    paginate_by = 10

    def get_queryset(self):
        sort = self.request.GET.get('sort', 'newest')
        queryset = Question.objects.all()
        if sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'active':
            queryset = queryset.order_by('-updated_at')
        elif sort == 'unanswered':
            queryset = queryset.filter(answers__isnull=True).order_by('-created_at')
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['sort'] = self.request.GET.get('sort', 'newest')
        context['popular_tags'] = Tag.objects.annotate(count=models.Count('questions')).order_by('-count')[:10]
        for question in context['questions']:
            question.votes_count = Vote.objects.filter(
                content_type=ContentType.objects.get_for_model(Question),
                object_id=question.id
            ).count()
            question.has_accepted_answer = question.answers.filter(is_accepted=True).exists()
        return context

class QuestionVoteView(LoginRequiredMixin, View):
    def post(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        vote_type = request.POST.get('vote_type')
        vote_value = 1 if vote_type == 'upvote' else -1 if vote_type == 'downvote' else 0
        content_type = ContentType.objects.get_for_model(question)
        vote, created = Vote.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=question.pk,
            defaults={'vote': vote_value}
        )
        if not created:
            vote.vote = vote_value
            vote.save()
        votes_total = Vote.objects.filter(content_type=content_type, object_id=question.pk).aggregate(total=Sum('vote'))['total'] or 0
        question.score = votes_total
        question.save()
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'votes_count': question.score, 'user_vote': vote_type})
        return redirect('forum:question_detail', pk=question.pk, slug=question.slug)

class QuestionListView(ListView):
    model = Question
    template_name = 'question_list.html'
    context_object_name = 'questions'
    paginate_by = 10

    def get_queryset(self):
        sort = self.request.GET.get('sort', 'newest')
        filter_option = self.request.GET.get('filter', 'all')
        queryset = Question.objects.all()
        if filter_option == 'no-answers':
            queryset = queryset.filter(answers__isnull=True)
        elif filter_option == 'no-accepted-answer':
            queryset = queryset.exclude(answers__is_accepted=True)
        if sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'active':
            queryset = queryset.order_by('-updated_at')
        elif sort == 'unanswered':
            queryset = queryset.filter(answers__isnull=True).order_by('-created_at')
        elif sort == 'votes':
            queryset = queryset.order_by('-score')
        elif sort == 'views':
            queryset = queryset.order_by('-views')
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['sort'] = self.request.GET.get('sort', 'newest')
        context['filter'] = self.request.GET.get('filter', 'all')
        context['popular_tags'] = Tag.objects.annotate(count=models.Count('questions')).order_by('-count')[:10]
        for question in context['questions']:
            question.has_accepted_answer = question.answers.filter(is_accepted=True).exists()
        return context

class BookmarkQuestionView(LoginRequiredMixin, View):
    http_method_names = ['post']
    def post(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, question=question)
        if not created:
            bookmark.delete()
            is_bookmarked = False
        else:
            is_bookmarked = True
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'is_bookmarked': is_bookmarked})
        return redirect('forum:question_detail', pk=question.pk, slug=question.slug)

class QuestionDetailView(DetailView):
    model = Question
    template_name = 'question_detail.html'
    context_object_name = 'question'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        question = self.object

        sort_param = self.request.GET.get('sort', 'votes')
        if sort_param == 'newest':
            answers = question.answers.order_by('-created_at')
        elif sort_param == 'oldest':
            answers = question.answers.order_by('created_at')
        else:
            answers = question.answers.order_by('-score', '-created_at')

        if self.request.user.is_authenticated:
            for answer in answers:
                try:
                    ct = ContentType.objects.get_for_model(answer.__class__)
                    vote = Vote.objects.get(user=self.request.user, content_type=ct, object_id=answer.id)
                    answer.user_vote = 'upvote' if vote.vote > 0 else 'downvote'
                except Vote.DoesNotExist:
                    answer.user_vote = None
        context['answers'] = answers
        context['sort'] = sort_param

        if self.request.user.is_authenticated:
            ct = ContentType.objects.get_for_model(Question)
            try:
                vote = Vote.objects.get(user=self.request.user, content_type=ct, object_id=question.id)
                context['user_vote'] = 'upvote' if vote.vote > 0 else 'downvote'
            except Vote.DoesNotExist:
                context['user_vote'] = None
            context['is_bookmarked'] = Bookmark.objects.filter(user=self.request.user, question=question).exists()
        else:
            context['user_vote'] = None
            context['is_bookmarked'] = False

        question.views += 1
        question.save(update_fields=['views'])

        context['all_badges'] = Badge.objects.all()

        return context


class GuidelineView(View):
    template_name = 'guidelines.html'
    def get(self, request):
        return render(request, self.template_name)

class UserListView(ListView):
    model = User
    template_name = 'user_list.html'
    context_object_name = 'users'
    paginate_by = 20

    def get_queryset(self):
        queryset = User.objects.all().select_related('profile').prefetch_related('questions', 'answers')
        sort = self.request.GET.get('sort')
        if sort == 'reputation':
            queryset = queryset.order_by('-profile__reputation')
        elif sort == 'newest':
            queryset = queryset.order_by('-date_joined')
        elif sort == 'name':
            queryset = queryset.order_by('username')
        else:
            queryset = queryset.order_by('-profile__reputation')
        return queryset

class QuestionCreateView(LoginRequiredMixin, CreateView):
    model = Question
    form_class = QuestionForm
    template_name = 'question_form.html'
    success_url = reverse_lazy('forum:index')

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['available_tags'] = Tag.objects.all()
        return context

class QuestionUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Question
    fields = ['title', 'body', 'tags']
    template_name = 'question_form.html'

    def test_func(self):
        question = self.get_object()
        return self.request.user == question.author

class QuestionDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Question
    template_name = 'question_confirm_delete.html'
    success_url = reverse_lazy('question-list')

    def test_func(self):
        question = self.get_object()
        return self.request.user == question.author

class AnswerCreateView(LoginRequiredMixin, View):
    def post(self, request, question_id):
        content = request.POST.get('content', '').strip()
        if not content:
            question = get_object_or_404(Question, id=question_id)
            return redirect('forum:question_detail', pk=question.id, slug=question.slug)
        question = get_object_or_404(Question, id=question_id)
        Answer.objects.create(question=question, body=content, author=request.user)
        return redirect('forum:question_detail', pk=question.id, slug=question.slug)

class AnswerUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Answer
    fields = ['body']
    template_name = 'answer_form.html'

    def test_func(self):
        answer = self.get_object()
        return self.request.user == answer.author

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class AnswerDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Answer
    template_name = 'answer_confirm_delete.html'

    def test_func(self):
        answer = self.get_object()
        return self.request.user == answer.author

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class AnswerVoteView(LoginRequiredMixin, View):
    def post(self, request, pk):
        answer = get_object_or_404(Answer, pk=pk)
        vote_type = request.POST.get('vote_type')
        vote_value = 1 if vote_type == 'upvote' else -1 if vote_type == 'downvote' else 0
        content_type = ContentType.objects.get_for_model(answer)
        vote, created = Vote.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=answer.pk,
            defaults={'vote': vote_value}
        )
        if not created:
            vote.vote = vote_value
            vote.save()
        votes_total = Vote.objects.filter(content_type=content_type, object_id=answer.pk).aggregate(total=Sum('vote'))['total'] or 0
        answer.score = votes_total
        answer.save()
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'votes_count': answer.score, 'user_vote': vote_type})
        return redirect('forum:question_detail', pk=answer.question.pk, slug=answer.question.slug)

class AcceptAnswerView(LoginRequiredMixin, View):
    def post(self, request, pk):
        answer = get_object_or_404(Answer, pk=pk)
        question = answer.question
        if request.user == question.author:
            question.answers.update(is_accepted=False)
            answer.is_accepted = True
            answer.save()
        return redirect('forum:question_detail', pk=question.pk, slug=question.slug)

class VoteCreateView(LoginRequiredMixin, CreateView):
    model = Vote
    fields = ['vote']
    template_name = 'vote_form.html'

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
    template_name = 'vote_confirm_delete.html'

    def test_func(self):
        vote = self.get_object()
        return self.request.user == vote.user

    def get_success_url(self):
        obj = self.object.content_object
        return obj.get_absolute_url() if hasattr(obj, 'get_absolute_url') else '/'

class ProfileDetailView(DetailView):
    model = User
    template_name = 'profile.html'
    context_object_name = 'profile_user'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profile_user = self.get_object()
        tab = self.request.GET.get('tab', 'questions')
        context['tab'] = tab
        questions_qs = Question.objects.filter(author=profile_user).select_related('author')
        answers_qs = Answer.objects.filter(author=profile_user).select_related('question', 'author')
        bookmarks_qs = Bookmark.objects.filter(user=profile_user).select_related('question')
        tags_qs = Tag.objects.filter(questions__author=profile_user).annotate(count=Count('questions')).distinct()
        context['questions_count'] = questions_qs.count()
        context['answers_count'] = answers_qs.count()
        context['questions'] = questions_qs
        context['answers'] = answers_qs
        context['bookmarks'] = bookmarks_qs
        context['tags'] = tags_qs
        return context
class ProfileForm(forms.ModelForm):
    email = forms.EmailField(required=False)

    class Meta:
        model = Profile
        fields = [
            'avatar',
            'bio',
        ]

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['email'].initial = user.email

    def save(self, commit=True):
        profile = super().save(commit=False)
        if commit:
            profile.save()
            if 'email' in self.cleaned_data:
                profile.user.email = self.cleaned_data['email']
                profile.user.save()
        return profile

class ProfileUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Profile
    form_class = ProfileForm
    template_name = 'edit_profile.html'

    def get_object(self, queryset=None):
        return self.request.user.profile

    def test_func(self):
        return self.request.user == self.get_object().user

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def get_success_url(self):
        return reverse('forum:profile', kwargs={'pk': self.request.user.pk})


class AwardedBadgeListView(LoginRequiredMixin, ListView):
    model = AwardedBadge
    template_name = 'userbadge_list.html'
    context_object_name = 'user_badges'

    def get_queryset(self):
        return AwardedBadge.objects.filter(user=self.request.user)

class AwardBadgeView(LoginRequiredMixin, View):
    def post(self, request, pk):
        badge_id = request.POST.get('badge_id')
        if not badge_id:
            return JsonResponse({'error': 'Badge ID not provided.'}, status=400)
        question = get_object_or_404(Question, pk=pk)
        badge = get_object_or_404(Badge, pk=badge_id)
        content_type = ContentType.objects.get_for_model(question)
        awarded_badge, created = AwardedBadge.objects.get_or_create(
            user=request.user,
            badge=badge,
            content_type=content_type,
            object_id=question.pk
        )
        if not created:
            awarded_badge.delete()
            awarded = False
        else:
            awarded = True
        return JsonResponse({'awarded': awarded})


class FavoriteCreateView(LoginRequiredMixin, CreateView):
    model = Favorite
    fields = []
    template_name = 'favorite_confirm.html'

    def form_valid(self, form):
        form.instance.user = self.request.user
        question = get_object_or_404(Question, id=self.kwargs.get('question_id'))
        form.instance.question = question
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class FavoriteDeleteView(LoginRequiredMixin, DeleteView):
    model = Favorite
    template_name = 'favorite_confirm_delete.html'

    def get_success_url(self):
        return reverse('question-detail', kwargs={'pk': self.object.question.id})

class NotificationListView(LoginRequiredMixin, ListView):
    model = Notification
    template_name = 'notification_list.html'
    context_object_name = 'notifications'

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationUpdateView(LoginRequiredMixin, UpdateView):
    model = Notification
    fields = ['is_read']
    template_name = 'notification_form.html'

    def form_valid(self, form):
        form.instance.is_read = True
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('notification-list')

class PostHistoryListView(ListView):
    model = PostHistory
    template_name = 'posthistory_list.html'
    context_object_name = 'histories'

class PostHistoryDetailView(DetailView):
    model = PostHistory
    template_name = 'posthistory_detail.html'
    context_object_name = 'history'

class TagListView(ListView):
    model = Tag
    template_name = 'tag_list.html'
    context_object_name = 'tags'
    paginate_by = 36

    def get_queryset(self):
        return Tag.objects.annotate(
            count=models.Count('questions'),
            today_count=models.Count(
                'questions',
                filter=models.Q(questions__created_at__date=timezone.now().date())
            )
        ).order_by('-count')


class TagDetailView(DetailView):
    model = Tag
    template_name = 'tag_detail.html'
    context_object_name = 'tag'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['questions'] = self.object.questions.all()
        return context


class TagCreateView(LoginRequiredMixin, CreateView):
    model = Tag
    fields = ['name', 'slug']
    template_name = 'tag_form.html'


class TagUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Tag
    fields = ['name', 'slug']
    template_name = 'tag_form.html'

    def test_func(self):
        return self.request.user.is_staff


class TagDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Tag
    template_name = 'tag_confirm_delete.html'
    success_url = reverse_lazy('tag_list')

    def test_func(self):
        return self.request.user.is_staff


class SearchView(TemplateView):
    template_name = 'search_results.html'
    paginate_by = 10  # Number of items per page

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        query = self.request.GET.get('q', '').strip()
        search_type = self.request.GET.get('type', 'all')
        page = self.request.GET.get('page', 1)

        context['query'] = query
        context['search_type'] = search_type

        if query:
            # Define your queries
            questions = Question.objects.filter(
                Q(title__icontains=query) | Q(body__icontains=query)
            ).order_by('-created_at')

            answers = Answer.objects.filter(
                body__icontains=query
            ).order_by('-created_at')

            users = User.objects.filter(
                Q(username__icontains=query) | Q(email__icontains=query)
            ).order_by('-date_joined')

            tags = Tag.objects.filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            ).annotate(count=Count('questions')).order_by('-count')

            # Store counts before pagination
            context['questions_count'] = questions.count() if search_type in ['all', 'questions'] else 0
            context['answers_count'] = answers.count() if search_type in ['all', 'answers'] else 0
            context['users_count'] = users.count() if search_type in ['all', 'users'] else 0
            context['tags_count'] = tags.count() if search_type in ['all', 'tags'] else 0

            # Apply pagination based on the search type
            if search_type == 'questions' or search_type == 'all':
                paginator = Paginator(questions, self.paginate_by)
                try:
                    context['questions'] = paginator.page(page)
                except PageNotAnInteger:
                    context['questions'] = paginator.page(1)
                except EmptyPage:
                    context['questions'] = paginator.page(paginator.num_pages)
            else:
                context['questions'] = []

            if search_type == 'answers' or search_type == 'all':
                paginator = Paginator(answers, self.paginate_by)
                try:
                    context['answers'] = paginator.page(page)
                except PageNotAnInteger:
                    context['answers'] = paginator.page(1)
                except EmptyPage:
                    context['answers'] = paginator.page(paginator.num_pages)
            else:
                context['answers'] = []

            if search_type == 'users' or search_type == 'all':
                paginator = Paginator(users, self.paginate_by)
                try:
                    context['users'] = paginator.page(page)
                except PageNotAnInteger:
                    context['users'] = paginator.page(1)
                except EmptyPage:
                    context['users'] = paginator.page(paginator.num_pages)
            else:
                context['users'] = []

            if search_type == 'tags' or search_type == 'all':
                paginator = Paginator(tags, self.paginate_by)
                try:
                    context['tags'] = paginator.page(page)
                except PageNotAnInteger:
                    context['tags'] = paginator.page(1)
                except EmptyPage:
                    context['tags'] = paginator.page(paginator.num_pages)
            else:
                context['tags'] = []
        else:
            # No query provided
            context['questions'] = []
            context['answers'] = []
            context['users'] = []
            context['tags'] = []
            context['questions_count'] = 0
            context['answers_count'] = 0
            context['users_count'] = 0
            context['tags_count'] = 0

        return context