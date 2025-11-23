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

class TestesAPITarefa(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_user', password='12345')
        self.token = Token.objects.create(user=self.user)
        
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.projeto = Projeto.objects.create(nome="Projeto API", dono=self.user)
        self.tarefa = Tarefa.objects.create(
            titulo="Tarefa API Original",
            descricao="Criada pelo setup",
            projeto=self.projeto,
            status=1,
            etiqueta=3
        )

        self.url_listar = reverse('api-listar-tarefas')
        self.url_criar = reverse('api-cadastrar-tarefa')
        self.url_editar = reverse('api-editar-tarefa', kwargs={'pk': self.tarefa.pk})
        self.url_deletar = reverse('api-deletar-tarefa', kwargs={'pk': self.tarefa.pk})

    def test_api_listar(self):
        response = self.client.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], "Tarefa API Original")

    def test_api_criar(self):
        data = {
            'titulo': 'Tarefa Via App',
            'descricao': 'Teste POST',
            'projeto': self.projeto.id, 
            'status': 1,
            'etiqueta': 1
        }
        response = self.client.post(self.url_criar, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tarefa.objects.count(), 2) 
        self.assertEqual(Tarefa.objects.last().titulo, 'Tarefa Via App')

    def test_api_editar(self):
        data = {
            'titulo': 'Tarefa Modificada',
            'projeto': self.projeto.id,
            'status': 3 
        }
        
        response = self.client.patch(self.url_editar, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tarefa.refresh_from_db()
        self.assertEqual(self.tarefa.titulo, 'Tarefa Modificada')
        self.assertEqual(self.tarefa.status, 3)

    def test_api_deletar(self):
        response = self.client.delete(self.url_deletar)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Tarefa.objects.count(), 0)

    def test_api_sem_token(self):
        client_anonimo = APIClient()
        response = client_anonimo.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)