from django import forms
from .models import Question, Tag

class QuestionForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        queryset=Tag.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text="Select up to 5 tags."
    )

    class Meta:
        model = Question
        fields = ['title', 'body', 'tags']
        widgets = {
            'body': forms.Textarea(attrs={'class': 'content-editor', 'rows': 10}),
        }

    def clean_tags(self):
        tags = self.cleaned_data.get('tags', [])
        if len(tags) > 5:
            raise forms.ValidationError("You can add up to 5 tags.")
        return tags