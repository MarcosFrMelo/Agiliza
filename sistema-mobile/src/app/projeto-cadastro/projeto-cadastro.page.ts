import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../login/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projeto-cadastro',
  templateUrl: './projeto-cadastro.page.html',
  styleUrls: ['./projeto-cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [Storage]
})
export class ProjetoCadastroPage implements OnInit {

  projeto = {
    id: null,
    nome: '',
    descricao: ''
  };
  
  usuario: Usuario = new Usuario();
  titulo = 'Novo Projeto';
  botaoTexto = 'Cadastrar';

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private router: Router
  ) { 
    const nav = this.router.getCurrentNavigation();
    if (nav && nav.extras && nav.extras.state) {
      const dadosRecebidos = nav.extras.state['projeto'];
      
      if (dadosRecebidos) {
        this.projeto = { 
          id: dadosRecebidos.id,
          nome: dadosRecebidos.nome,
          descricao: dadosRecebidos.descricao
        };
        this.titulo = 'Editar Projeto';
        this.botaoTexto = 'Salvar Alterações';
      }
    }
  }

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');
    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
    }
  }

  onFileSelected(event: any) {
    console.log("Arquivo selecionado:", event.target.files[0]);
  }

  async salvar() {
    if (!this.projeto.nome) {
      this.mostrarToast('O nome é obrigatório!');
      return;
    }

    if (this.projeto.id) {
      this.atualizarProjeto();
    } else {
      this.cadastrarProjeto();
    }
  }

  async cadastrarProjeto() {
    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: 'http://127.0.0.1:8000/projeto/api/cadastrar/',
      data: {
        nome: this.projeto.nome,
        descricao: this.projeto.descricao
      }
    };

    CapacitorHttp.post(options)
      .then((res: HttpResponse) => {
        loading.dismiss();
        if (res.status === 201) {
          this.mostrarToast('Projeto criado com sucesso!');
          this.navCtrl.back();
        } else {
          this.mostrarToast('Erro ao criar: ' + res.status);
        }
      })
      .catch((err) => {
        loading.dismiss();
        console.error(err);
        this.mostrarToast('Erro de conexão.');
      });
  }

  async atualizarProjeto() {
    const loading = await this.loadingCtrl.create({ message: 'Atualizando...' });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/projeto/api/editar/${this.projeto.id}/`,
      data: {
        nome: this.projeto.nome,
        descricao: this.projeto.descricao
      }
    };

    CapacitorHttp.put(options)
      .then((res: HttpResponse) => {
        loading.dismiss();
        if (res.status === 200) {
          this.mostrarToast('Projeto atualizado!');
          this.navCtrl.back();
        } else {
          this.mostrarToast('Erro ao atualizar: ' + res.status);
        }
      })
      .catch((err) => {
        loading.dismiss();
        console.error(err);
        this.mostrarToast('Erro de conexão.');
      });
  }

  async mostrarToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000 });
    t.present();
  }

  cancelar() {
    this.navCtrl.back();
  }
}