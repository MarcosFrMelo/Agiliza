import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.page.html',
  styleUrls: ['./projetos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class ProjetosPage implements OnInit {

  projetos: any[] = []; // Lista que o HTML espera

  constructor(
    private http: HttpClient,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) { }

  ionViewWillEnter() {
    this.carregarProjetos();
  }

  ngOnInit() {}

  carregarProjetos() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/projeto/api/listar/`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (dados) => {
        this.projetos = dados;
      },
      error: (erro) => {
        console.error(erro);
        if (erro.status === 401) this.logout();
      }
    });
  }

  async presentActionSheet(projeto: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: projeto.nome,
      buttons: [
        {
          text: 'Editar',
          icon: 'create',
          handler: () => {
            this.router.navigate(['/projeto-cadastro', projeto.id]);
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deletarProjeto(projeto.id);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  deletarProjeto(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/projeto/api/deletar/${id}/`;

    this.http.delete(url, { headers }).subscribe(() => {
      this.carregarProjetos();
      this.exibirToast('Projeto excluído');
    });
  }

  async exibirToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000 });
    t.present();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}