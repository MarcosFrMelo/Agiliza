from django import forms
from .models import Projeto

class ProjetoForm(forms.ModelForm):
    class Meta:
        model = Projeto
        fields = ['nome', 'descricao', 'imagem_capa']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nome do Projeto'}),
            'descricao': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'imagem_capa': forms.FileInput(attrs={'class': 'form-control'}),
        }