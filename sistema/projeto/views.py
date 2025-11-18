from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Projeto
from .forms import ProjetoForm
from django.core.exceptions import ObjectDoesNotExist
from django.http import FileResponse, Http404
from django.views.generic import View

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
    
class FotoProjeto(View):
    """
    View para exibir a foto de um projeto.
    """
    def get(self, request, arquivo):
        try:
            projeto = Projeto.objects.get(imagem_capa='projeto/fotos/{}'.format(arquivo))
            return FileResponse(projeto.imagem_capa)
        except ObjectDoesNotExist:
            raise Http404("Foto do Veículo não encontrado")
        except Exception as e:
            raise e