from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Tarefa
from .forms import TarefaForm
from projeto.models import Projeto
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializers import TarefaSerializer

class TarefaNova(LoginRequiredMixin, CreateView):
    model = Tarefa
    form_class = TarefaForm
    template_name = 'tarefa/nova.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['projeto'] = get_object_or_404(Projeto, pk=self.kwargs['projeto_id'])
        return context

    def form_valid(self, form):
        projeto = get_object_or_404(Projeto, pk=self.kwargs['projeto_id'])
        form.instance.projeto = projeto
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('quadro-projeto', kwargs={'pk': self.kwargs['projeto_id']})

class TarefaEditar(LoginRequiredMixin, UpdateView):
    model = Tarefa
    form_class = TarefaForm
    template_name = 'tarefa/editar.html'

    def get_success_url(self):
        return reverse_lazy('quadro-projeto', kwargs={'pk': self.object.projeto.id})

class TarefaDeletar(LoginRequiredMixin, DeleteView):
    model = Tarefa
    template_name = 'tarefa/deletar.html'
    
    def get_success_url(self):
        return reverse_lazy('quadro-projeto', kwargs={'pk': self.object.projeto.id})
    
class APIListarTarefas(ListAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tarefa.objects.filter(projeto__dono=self.request.user)

class APICriarTarefa(CreateAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class APIEditarTarefa(UpdateAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tarefa.objects.filter(projeto__dono=self.request.user)

class APIExcluirTarefa(DestroyAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tarefa.objects.filter(projeto__dono=self.request.user)