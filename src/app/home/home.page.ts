import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Clipboard } from '@capacitor/clipboard';
import { ToastController, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  // Accès aux inputs via ViewChild
  @ViewChild('audioInput') audioInput!: ElementRef;
  @ViewChild('videoInput') videoInput!: ElementRef;

  transcribedText = '';
  isRecording = false;
  audioURL: SafeUrl | null = null;
  previewType: 'audio' | 'video' | null = null;

  // Variables MediaRecorder
  private mediaRecorder: any;
  private audioChunks: Blob[] = [];
  recordingSeconds = 0;
  recordingTime = '00:00';
  private timerInterval: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private sanitizer: DomSanitizer,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  // ==========================================
  // 🎙️ GESTION DU MICRO
  // ==========================================

  resetTranscription() {
  this.transcribedText = '';
  }
  // 🎙️ Start recording
  // 🎙️ Start recording
  async startRecording() {
    this.resetTranscription();     
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.previewType = 'audio';
        const url = URL.createObjectURL(audioBlob);
        this.audioURL = this.sanitizer.bypassSecurityTrustUrl(url);
        
        // On envoie au backend
        console.log(audioBlob);
        console.log(audioBlob instanceof File);
        this.sendToBackend(audioBlob);
        this.cdr.detectChanges();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTimer();
    } catch (err) {
      console.error("Erreur micro:", err);
      this.showToast("Impossible d'accéder au micro", 'danger');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
      // On coupe le flux micro pour libérer le hardware
      this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
    }
  }

  // ==========================================
  // 📂 GESTION DES FICHIERS & LIENS
  // ==========================================

async presentFileOptions() {
  const actionSheet = await this.actionSheetCtrl.create({
    header: 'IMPORTER UN FICHIER',
    cssClass: 'custom-action-sheet',
    buttons: [
      {
        text: 'Audio local',
        icon: 'musical-notes',
        handler: () => this.audioInput.nativeElement.click()
      },
      {
        text: 'Vidéo locale',
        icon: 'videocam',
        handler: () => this.videoInput.nativeElement.click()
      }
    ]
  });

  await actionSheet.present();

  // Fermer au clic sur le ❌
  document
    .querySelector('.custom-action-sheet .action-sheet-wrapper')
    ?.addEventListener('click', (e: any) => {
      if (e.target.textContent === '✕') {
        actionSheet.dismiss();
      }
    });
}







  // ==========================================
  // 📡 COMMUNICATION BACKEND
  // ==========================================

  async sendToBackend(fileOrBlob: Blob | File) {
    const loading = await this.loadingCtrl.create({ message: 'Transcription en cours...' });
    await loading.present();

    const formData = new FormData();
    formData.append('file', fileOrBlob, (fileOrBlob instanceof File) ? fileOrBlob.name : 'recording.webm');

    this.http.post<any>('http://192.168.1.6:8000/transcribe', formData).subscribe({
      next: (res) => {
        this.transcribedText = res.text;
        loading.dismiss();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur Backend:", err);
        loading.dismiss();
        this.showToast("Échec de la transcription", 'danger');
      }
    });
  }

  

  // ==========================================
  // 🛠️ UTILS (Timer, Toast, Export)
  // ==========================================

  private startTimer() {
    this.recordingSeconds = 0;
    this.timerInterval = setInterval(() => {
      this.recordingSeconds++;
      const min = Math.floor(this.recordingSeconds / 60).toString().padStart(2, '0');
      const sec = (this.recordingSeconds % 60).toString().padStart(2, '0');
      this.recordingTime = `${min}:${sec}`;
    }, 1000);
  }

  private stopTimer() {
    clearInterval(this.timerInterval);
  }

  async copyText() {
    await Clipboard.write({ string: this.transcribedText });
    this.showToast('Copié !', 'success');
  }

  async showToast(msg: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: color as any });
    toast.present();
  }

  // Garde tes fonctions downloadDocx(), downloadPdf(), etc.
  async presentDownloadActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Exporter',
      buttons: [
        { text: 'Word', icon: 'document-text', handler: () => this.downloadDocx() },
        { text: 'PDF', icon: 'document-attach', handler: () => this.downloadPdf() },
        { text: 'Annuler', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  downloadDocx() {
    const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun(this.transcribedText)] })] }] });
    Packer.toBlob(doc).then(blob => saveAs(blob, 'transcription.docx'));
  }

  downloadPdf() {
    const doc = new jsPDF();
    doc.text(doc.splitTextToSize(this.transcribedText, 180), 10, 10);
    doc.save('transcription.pdf');
    this.showToast('Téléchargement PDF terminé');
  }

  // 4. Générer TXT
  downloadTxt() {
    const blob = new Blob([this.transcribedText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'transcription.txt');
    this.showToast('Téléchargement Texte terminé');
  }

  // Petit utilitaire pour afficher un message
  async showSuccessToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    toast.present();
  }
  onAudioFileSelected(event: any) {
    this.resetTranscription();     
  const file = event.target.files[0];
  if (!file) return;

  this.handleImportedFile(file);
}

onVideoFileSelected(event: any) {
  this.resetTranscription();     
  const file = event.target.files[0];
  if (!file) return;

  this.handleImportedFile(file);
}

handleImportedFile(file: File) {
  const url = URL.createObjectURL(file);
  this.audioURL = this.sanitizer.bypassSecurityTrustUrl(url);

  if (file.type.startsWith('video')) {
    this.previewType = 'video';
  } else {
    this.previewType = 'audio';
  }
  console.log(file);
  console.log(file instanceof File);
  this.sendToBackend(file);
}



}


