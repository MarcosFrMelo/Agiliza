from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.test import TestCase
from django.urls import reverse
from tarefa.models import Tarefa
from tarefa.forms import TarefaForm
from projeto.models import Projeto

class TestesModelTarefa(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste_model', password='12345')
        self.projeto = Projeto.objects.create(
            nome="Projeto Teste", 
            dono=self.user
        )
        self.instancia = Tarefa.objects.create(
            titulo="Comprar passagens",
            descricao="Ir para SP",
            status=1,
            etiqueta=1,
            projeto=self.projeto
        )
    
    def test_str(self):
        status_display = self.instancia.get_status_display()
        expected_str = f"Comprar passagens ({status_display})"
        self.assertEqual(str(self.instancia), expected_str)

    def test_criacao(self):
        self.assertEqual(self.instancia.titulo, "Comprar passagens")
        self.assertEqual(self.instancia.projeto, self.projeto)

class TestesViewNovaTarefa(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        
        self.projeto = Projeto.objects.create(nome="Projeto Pai", dono=self.user)
        
        self.url = reverse('nova-tarefa', kwargs={'projeto_id': self.projeto.pk})
        
    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('form'), TarefaForm)

        self.assertEqual(response.context.get('projeto'), self.projeto)

    def test_post(self):
        data = {
            'titulo': 'Nova Tarefa',
            'descricao': 'Descrição da tarefa',
            'status': 1,
            'etiqueta': 2
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('quadro-projeto', kwargs={'pk': self.projeto.pk}))
        self.assertEqual(Tarefa.objects.count(), 1)

        tarefa_salva = Tarefa.objects.first()
        self.assertEqual(tarefa_salva.titulo, 'Nova Tarefa')
        self.assertEqual(tarefa_salva.projeto, self.projeto)

class TestesViewEditarTarefa(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        
        self.projeto = Projeto.objects.create(nome="Projeto Pai", dono=self.user)
        self.instancia = Tarefa.objects.create(
            titulo="Tarefa Antiga",
            projeto=self.projeto,
            status=1
        )
        self.url = reverse('editar-tarefa', kwargs={'pk': self.instancia.pk})

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('object'), Tarefa)
        self.assertEqual(response.context.get('object').pk, self.instancia.pk)

    def test_post(self):
        data = {
            'titulo': 'Tarefa Editada',
            'descricao': 'Nova descrição',
            'status': 2,
            'etiqueta': 3
        }
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('quadro-projeto', kwargs={'pk': self.projeto.pk}))

        self.instancia.refresh_from_db()
        self.assertEqual(self.instancia.titulo, 'Tarefa Editada')
        self.assertEqual(self.instancia.status, 2)

class TestesViewDeletarTarefa(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        
        self.projeto = Projeto.objects.create(nome="Projeto Pai", dono=self.user)
        self.instancia = Tarefa.objects.create(
            titulo="Tarefa Deletar",
            projeto=self.projeto
        )
        self.url = reverse('deletar-tarefa', kwargs={'pk': self.instancia.pk})

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('object'), Tarefa)

    def test_post(self):
        response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('quadro-projeto', kwargs={'pk': self.projeto.pk}))

        self.assertEqual(Tarefa.objects.count(), 0)

class TestesAPIListarTarefas(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_list', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.projeto = Projeto.objects.create(nome="Projeto API", dono=self.user)
        Tarefa.objects.create(titulo="Tarefa 1", projeto=self.projeto)
        self.url = reverse('api-listar-tarefas')

    def test_listar(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class TestesAPICriarTarefa(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_create', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.projeto = Projeto.objects.create(nome="Projeto API", dono=self.user)
        self.url = reverse('api-cadastrar-tarefa')

    def test_criar(self):
        data = {
            'titulo': 'Tarefa Nova API',
            'projeto': self.projeto.id,
            'status': 1,
            'etiqueta': 1
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tarefa.objects.count(), 1)

class TestesAPIEditarTarefa(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_edit', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.projeto = Projeto.objects.create(nome="Projeto API", dono=self.user)
        self.tarefa = Tarefa.objects.create(titulo="Original", projeto=self.projeto)
        self.url = reverse('api-editar-tarefa', kwargs={'pk': self.tarefa.pk})

    def test_editar(self):
        data = {'titulo': 'Modificado API', 'projeto': self.projeto.id}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tarefa.refresh_from_db()
        self.assertEqual(self.tarefa.titulo, 'Modificado API')

class TestesAPIExcluirTarefa(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_delete', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.projeto = Projeto.objects.create(nome="Projeto API", dono=self.user)
        self.tarefa = Tarefa.objects.create(titulo="Para Deletar", projeto=self.projeto)
        self.url = reverse('api-deletar-tarefa', kwargs={'pk': self.tarefa.pk})

    def test_deletar(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Tarefa.objects.count(), 0)