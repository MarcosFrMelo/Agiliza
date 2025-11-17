from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Projeto
from .forms import ProjetoForm

class ProjetoListar(LoginRequiredMixin, ListView):
    model = Projeto
    template_name = 'projeto/listar.html'
    context_object_name = 'projetos'

    def get_queryset(self):
        return Projeto.objects.filter(dono=self.request.user)

class ProjetoNovo(LoginRequiredMixin, CreateView):
    model = Projeto
    form_class = ProjetoForm
    template_name = 'projeto/novo.html'
    success_url = reverse_lazy('listar-projetos')

    def form_valid(self, form):
        form.instance.dono = self.request.user
        return super().form_valid(form)

class ProjetoEditar(LoginRequiredMixin, UpdateView):
    model = Projeto
    form_class = ProjetoForm
    template_name = 'projeto/editar.html'
    success_url = reverse_lazy('listar-projetos')
    
    def get_queryset(self):
        return Projeto.objects.filter(dono=self.request.user)

class ProjetoDeletar(LoginRequiredMixin, DeleteView):
    model = Projeto
    template_name = 'projeto/deletar.html'
    success_url = reverse_lazy('listar-projetos')

    def get_queryset(self):
        return Projeto.objects.filter(dono=self.request.user)