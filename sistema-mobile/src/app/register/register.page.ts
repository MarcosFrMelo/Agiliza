import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../login/usuario.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [Storage]
})
export class RegisterPage implements OnInit {

  public usuario: Usuario = new Usuario();

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_toast: ToastController,
    public storage: Storage
  ) { }

  async ngOnInit() {
    await this.storage.create();
  }

  async registrarUsuario() {
    const loading = await this.controle_carregamento.create({message: 'Criando conta...', duration: 15000});
    await loading.present();

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/api/usuario/registrar/',
      data: this.usuario
    };

    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        if (resposta.status == 201) {
          loading.dismiss();
          
          this.apresenta_mensagem('Conta criada com sucesso!', 'success');
          
          this.fazerLoginAutomatico();
        } else {
          loading.dismiss();
          this.apresenta_mensagem(`Erro ao criar: ${resposta.status}`, 'danger');
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem('Falha na conexão', 'danger');
      });
  }

  async fazerLoginAutomatico() {
    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/autenticacao-api/',
      data: { username: this.usuario.username, password: this.usuario.password }
    };

    CapacitorHttp.post(options).then(async (res) => {
        if(res.status == 200) {
            this.usuario.token = res.data.token;
            await this.storage.set('usuario', this.usuario);
            this.controle_navegacao.navigateRoot('/projetos');
        }
    });
  }

  async apresenta_mensagem(texto: string, cor: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      duration: 2000,
      color: cor
    });
    mensagem.present();
  }
}